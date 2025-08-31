const isProductionBuild = process.env.NODE_ENV === 'production';

/* eslint-disable no-console */
module.exports = {
    /* https://cli.vuejs.org/config/#publicpath */
    //publicPath: process.env.NODE_ENV === 'production' ? './' : '/',

    productionSourceMap: !isProductionBuild,

    chainWebpack: (config) => {
        if (isProductionBuild) {
            console.log('Building for production');

            config.optimization.minimizer('terser').tap((args) => {
                args[0].terserOptions.output = {
                    ...args[0].terserOptions.output,
                    comments: true,
                    beautify: false
                };
                args[0].terserOptions.compress = {
                    ...args[0].terserOptions.compress
                    // dropConsole: false
                };

                return args;
            });

            config.optimization.minimize(true);

        } else {
            console.log('Building for test');

            config.optimization.minimize(false);
        }

        config.optimization.splitChunks({
            cacheGroups: {
                commons: {
                    chunks: 'initial',
                    minChunks: 2,
                    maxInitialRequests: 5,
                    minSize: 0 
                },
                // Separated node_modules chunk
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    chunks: 'initial',
                    name: 'vendor',
                    priority: 10,
                    enforce: true
                }
            }
        });
        config.optimization.concatenateModules(true);
        config.optimization.flagIncludedChunks(true);
        config.optimization.mergeDuplicateChunks = true;
        config.optimization.innerGraph = true;
        config.optimization.removeAvailableModules = true;
        config.optimization.runtimeChunk('single');
        config.optimization.chunkIds = 'named'; //config.optimization.namedChunks(true);
        config.optimization.moduleIds = 'named'; //config.optimization.namedModules(true);
        //config.optimization.delete('splitChunks');
    },

    configureWebpack: {
        devtool: isProductionBuild ? undefined : 'eval-source-map',// isProductionBuild ? 'none' : 'source-map'

        watchOptions: {
            aggregateTimeout: 300,
            poll: 1000
        }
    },

    devServer: {
        port: 8081,
        allowedHosts: 'all', //disableHostCheck: true,
        host: 'localhost',
        server: {
            type: 'http',
            options: {
                key: '',
                cert: ''
            }
        }
    },

    lintOnSave: true
};
