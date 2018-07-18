import fs from 'fs';
import rimraf from 'rimraf';
import chokidar from 'chokidar';
import { resolve, dirname, relative } from 'path';
import { DefinePlugin, EnvironmentPlugin, optimize } from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import MinifyPlugin from 'babel-minify-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import WXAppWebpackPlugin, { Targets } from 'wxapp-webpack-plugin';

const isDev = process.env.NODE_ENV !== 'production';

const relativeFileLoader = (ext = '[ext]') => ({
    loader: 'file-loader',
    options: {
        // useRelativePath: true,
        name(file) {
            const relativePath = relative(__dirname, file);
            const path = relativePath.split('/').slice(2, -1).join('/');
            // console.log(relativePath, path);
            return `${path}/[name].${ext}`;
        },
        context: resolve('src'),
    },
});

const readDirSync = (path) => {
    let files = [];
    let dirs = [];
    let tmp;

    const pa = fs.readdirSync(path);
    pa.forEach((ele) => {
        const elePath = resolve(`${path}/${ele}`);
        const info = fs.statSync(elePath);
        if (info.isDirectory()) {
            // console.log(`dir: ${elePath}`);
            dirs.push(elePath);
            tmp = readDirSync(elePath);
            files = files.concat(tmp.files);
            dirs = dirs.concat(tmp.dirs);
        } else {
            // console.log(`file: ${elePath}`);
            files.push(elePath);
        }
    });
    return {
        dirs,
        files,
    };
};

/* eslint-disable consistent-return */
const mkdirsSync = (dir) => {
    // console.log(dirname);
    if (fs.existsSync(dir)) {
        return true;
    }
    if (mkdirsSync(dirname(dir))) {
        fs.mkdirSync(dir);
        return true;
    }
};

export default (env = {}) => {
    const mode = process.env.mode;
    if (process.env.mode !== '') {
        console.log(`***********      link package ${mode} start         ***********`);
        if (!fs.existsSync('src_modules/base')) {
            throw new Error('init src_modules/base');
        }
        if (!fs.existsSync(`src_modules/${mode}`)) {
            throw new Error(`cannot find src_modules/${mode}`);
        }
        // 清空src
        rimraf.sync('src');
        // 先软连接基础包
        const base = readDirSync('src_modules/base');
        base.dirs.forEach((dir) => {
            // console.log(dir);
            mkdirsSync(dir.replace('src_modules/base', 'src'));
        });
        base.files.forEach((file) => {
            // console.log(file);
            const baseFile = file.replace('src_modules/base', 'src');
            fs.symlinkSync(file, baseFile);
        });

        // 遍历马甲包，把文件覆盖上去
        const pkg = readDirSync(`src_modules/${mode}`);
        pkg.files.forEach((file) => {
            const baseFile = file.replace(`src_modules/${mode}`, 'src');
            if (fs.existsSync(baseFile)) {
                rimraf.sync(baseFile);
                fs.symlinkSync(file, baseFile);
                console.log(`replace file ${baseFile}`);
            } else {
                console.warn(`cannot find base file: ${baseFile}`);
            }
        });
        console.log(`***********      link package ${mode} complete      ***********\n\n\n\n\n\n`);
        // 开始监听文件夹
        chokidar
            .watch(`src_modules/${mode}`)
            .on('add', path => console.log(`File ${path} has been added`))
            .on('addDir', path => console.log(`Directory ${path} has been added`));
    }

    const target = env.target || 'Wechat';
    return {
        entry: {
            app: [`${resolve('src')}/app.js`],
        },
        output: {
            filename: '[name].js',
            publicPath: '/',
            path: resolve('dist'),
        },
        target: Targets[target],
        module: {
            rules: [{
                test: /\.js$/,
                include: /(src|node_modules)/,
                use: [{
                    loader: 'babel-loader?cacheDirectory=true',
                }],
            },
            {
                test: /\.less$/,
                include: /src/,
                use: [
                    relativeFileLoader('wxss'),
                    {
                        loader: 'less-loader',
                        options: {
                            includePaths: [resolve('src')],
                        },
                    },
                ],
            },
            {
                test: /\.(png|jpg|gif)$/,
                include: /src/,
                use: relativeFileLoader(),
            },
            {
                test: /\.(json)$/,
                include: /src/,
                use: relativeFileLoader(),
            },
            {
                test: /\.wxml$/,
                include: resolve('src'),
                use: [
                    relativeFileLoader('wxml'),
                    {
                        loader: 'wxml-loader',
                        options: {
                            root: resolve('src'),
                            enforceRelativePath: true,
                            // minimize: !isDev, 始终有问题算了
                        },
                    },
                ],
            },
            ],
        },
        plugins: [
            new EnvironmentPlugin({
                NODE_ENV: 'development',
            }),
            new DefinePlugin({
                __DEV__: isDev,
            }),
            new WXAppWebpackPlugin({
                clear: !isDev,
            }),
            isDev &&
            new UglifyJsPlugin({
                parallel: true,
                sourceMap: false,
            }),
            isDev && new MinifyPlugin(),
            new optimize.ModuleConcatenationPlugin(),
            new CopyWebpackPlugin([{
                context: 'src/static',
                from: '**/*',
                to: 'static',
            }]),
        ].filter(Boolean),
        devtool: isDev ? 'source-map' : false,
        resolve: {
            modules: [resolve('src'), 'node_modules'],
        },
        watchOptions: {
            ignored: /dist|manifest/,
            aggregateTimeout: 300,
        },
    };
};
