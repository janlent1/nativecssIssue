const path = require('path')
const webpack = require('webpack')
const RawSource = require("webpack-sources").RawSource;
const HtmlWebPackPlugin = require('html-webpack-plugin')
const BabelOptions = {
    configFile: path.resolve(__dirname, "babel.config.js")
};
const babelLoader = {
    loader: 'babel-loader',
    options: BabelOptions
};
module.exports = {
    plugins: [
        new HtmlWebPackPlugin({
            template: path.resolve(__dirname,`./index.html`),
            filename: `./index.html`
        }),
        {
            apply: function (compiler) {
                compiler.hooks.thisCompilation.tap("BuildManifest", function(compilation, compilationParams) {
                    compilation.hooks.processAssets.tapAsync({
                            name: 'BuildManifest',
                            stage: webpack.Compilation.PROCESS_ASSETS_STAGE_REPORT
                        },
                        function (assets, callback) {
                            const procMainFiles = {};
                            const procCssMainFiles = {};
                            compilation.entrypoints.forEach((entrypoint, name) => {
                                procMainFiles[name] = entrypoint.getFiles().filter(thisAsset => !(thisAsset.endsWith(".map") || thisAsset.endsWith(".css")));
                            });
                            compilation.entrypoints.forEach((entrypoint, name) => {
                                procCssMainFiles[name] = entrypoint.getFiles().filter(thisAsset => thisAsset.endsWith(".css"));
                            });
                            compilation.emitAsset('buildManifest.json', new RawSource(JSON.stringify({
                                entrypoints: procMainFiles,
                                cssEntrypoints: procCssMainFiles,
                            })))
                            callback();
                        })
                })
            }
        }
    ],
    target: "browserslist: last 1 Chrome versions, last 1 Edge versions, iOS >= 10.7",
    mode: 'development',
    entry: path.resolve(__dirname, 'source_folder/TestJsFile.js'),
    module: {  
        rules: [
            {
                test: /\.css$/,
                resolve: {
                    fullySpecified: false
                },
                type: 'css'
            },
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: [babelLoader]
            }
        ]
    },
    output: {
        path: path.resolve(__dirname, './dist_webpack'),
        filename: 'bundle.js',
    },
    experiments: {
        css: true
    },
    devtool:'source-map',
    devServer: {
         static: path.resolve(__dirname, './dist'),
    },
    resolve: {
        extensions: ['*', '.js']
    },
}