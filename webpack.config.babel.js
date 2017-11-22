import {
    resolve,
} from 'path';
import {
    DefinePlugin,
    EnvironmentPlugin,
    optimize,
} from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import WXAppWebpackPlugin, {
    Targets,
} from 'wxapp-webpack-plugin';

const isDev = process.env.NODE_ENV !== 'production';

const relativeFileLoader = (ext = '[ext]') => [{
        loader: 'file-loader',
        options: {
            publicPath: '',
            useRelativePath: true,
            name: `[name].${ext}`,
            emitFile: false,
        },
    },
    {
        loader: 'file-loader',
        options: {
            publicPath: '',
            context: resolve('src'),
            name: `[path][name].${ext}`,
        },
    },
];

export default (env = {}) => {
    const target = env.target || 'Wechat';

    return {
        entry: {
            app: [
                `${resolve('src')}/app.js`,
            ]
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
                    include: /src/,
                    use: [{
                        loader: 'babel-loader?cacheDirectory=true',
                    }],
                },
                {
                    test: /\.less$/,
                    include: /src/,
                    use: [
                        ...relativeFileLoader('wxss'),
                        {
                            loader: 'less-loader',
                            options: {
                                includePaths: [
                                    resolve('src'),
                                ],
                            },
                        },
                    ],
                },
                {
                    test: /\.(json|png|jpg|gif)$/,
                    include: /src/,
                    use: relativeFileLoader(),
                },
                {
                    test: /\.wxml$/,
                    include: resolve('src'),
                    use: [
                        ...relativeFileLoader('wxml'),
                        {
                            loader: 'wxml-loader',
                            options: {
                                root: resolve('src'),
                                // minimize: !isDev, TODO: bug fix: https://github.com/Cap32/wxml-loader/issues/5#issuecomment-346028264
                            },
                        },
                    ],
                },
                {
                    test: /\.wxml$/,
                    include: /node_modules/,
                    use: [{
                            loader: 'file-loader',
                            options: {
                                useRelativePath: false,
                                name: '[name].[ext]',
                            },
                        },
                        {
                            loader: 'wxml-loader',
                            options: {
                                root: resolve('src'),
                                // minimize: !isDev,
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
            new UglifyJsPlugin({
                parallel: true,
                sourceMap: isDev,
                uglifyOptions: {
                    ecma: 6,
                    compress: !isDev,
                    warnings: !isDev,
                }
            }),
            new optimize.ModuleConcatenationPlugin(),
            new CopyWebpackPlugin([{
                context: 'src/static',
                from: '**/*',
                to: 'static'
            }, ])
            // new IgnorePlugin(/vertx/),
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
