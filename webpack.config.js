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
    entry: {
        main: {
            import: ['@babel/polyfill',path.resolve(__dirname, 'source_folder/TestJsFile.js')],
        },
        secondMain: {
            import: ['@babel/polyfill',path.resolve(__dirname, 'source_folder/secondTestJsFile.js')],
        }
    },
    optimization: {
        nodeEnv:  "development",
        usedExports: 'global',
        removeAvailableModules: true,
        removeEmptyChunks: true,
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                common: {
                    name: false,
                    reuseExistingChunk: true,
                    minChunks: 1,
                    test(module) {
                        return true;
                    }
                }
            }
        }
    }, 
    module: { 
        unsafeCache: true, 
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
            },
            {
                test: /\.(woff)$/i,
                type: 'asset/resource',
                generator: {
                    filename: 'fonts/[name].[hash][ext]'
                },
                resolve: {
                    fullySpecified: false
                }
            },
        ]
    },
    resolve: {
        extensions: [".js", ".ts", ".tsx"],
        modules: [
            './source_folder',
            'node_modules'
        ],
        // By not specifying a file extension, it will search using "extensions" defined above.
        alias: {
            "current-theme": path.resolve('./source_folder', 'testTheme')
        }
    },
    output: {
        pathinfo: false,
        path: path.resolve(__dirname, './dist_webpack'),
        filename: '[name].bundle.js',
        cssFilename: '[name].bundle.css',
        chunkFilename: '[name].chunk.bundle.js',
        cssChunkFilename: '[name].chunk.bundle.css',
        publicPath: './',
    },
    experiments: {
        css: true
    },
    devtool: false,
    devServer: {
        static: path.resolve(__dirname, './dist'),
    },
}