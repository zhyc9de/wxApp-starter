import { resolve } from 'path';
import { DefinePlugin, EnvironmentPlugin, optimize } from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';
import MinifyPlugin from 'babel-minify-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import WXAppWebpackPlugin, { Targets } from 'wxapp-webpack-plugin';

const isDev = process.env.NODE_ENV !== 'production';

const relativeFileLoader = (ext = '[ext]') => ({
    loader: 'file-loader',
    options: {
        useRelativePath: true,
        name: `[name].${ext}`,
        context: resolve('src'),
    },
});

export default (env = {}) => {
    const target = env.target || 'Wechat';

    return {
        entry: {
            app: [
                `${resolve('src')}/app.js`,
            ],
        },
        output: {
            filename: '[name].js',
            publicPath: '/',
            path: resolve('dist'),
        },
        target: Targets[target],
        module: {
            rules: [
                {
                    test: /\.js$/,
                    include: /(src|node_modules)/,
                    use: [
                        {
                            loader: 'babel-loader?cacheDirectory=true',
                        },
                    ],
                },
                {
                    test: /\.less$/,
                    include: /src/,
                    use: [
                        relativeFileLoader('wxss'),
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
            !isDev && new UglifyJsPlugin({
                parallel: true,
                sourceMap: false,
            }),
            !isDev && new MinifyPlugin(),
            new optimize.ModuleConcatenationPlugin(),
            new CopyWebpackPlugin([
                {
                    context: 'src/static',
                    from: '**/*',
                    to: 'static',
                },
            ]),
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
