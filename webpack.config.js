const webpack = require('webpack')
const path = require('path')
const port = require("./config.json").port

module.exports = {
    entry: {
        main: [
            `webpack-hot-middleware/client?path=http://localhost:${port}/__webpack_hmr&reload=true`,
            path.resolve(__dirname, `./src/core/app.js`)
        ]
    },

    output: {
        path: path.resolve(__dirname, 'src/public'),
        filename: 'main.js',
        publicPath: '/'
    },

    stats: {
        colors: true,
        reasons: true,
        errorDetails: true
    },

    resolve: {
        extensions: [".js", ".ts"],
    },

    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                use: [
                    {
                        loader: 'babel-loader'
                    }
                ],
                exclude: /node_modules/
            },
        ]
    },

    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.ProvidePlugin({})
    ]
}