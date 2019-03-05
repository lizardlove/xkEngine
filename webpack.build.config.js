const webpack = require('webpack')
const path = require('path')
const cleanWebpackPlugin = require('clean-webpack-plugin')
module.exports = {
    mode: 'production',
    entry: {
        main: path.resolve(__dirname, './src/core/app.js')
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'main.js',
        publicPath: '/'
    },

    module: {
        rules: [
            {
                test: /\.(js|ts)$/,
                use: {
                    loader: 'babel-loader'
                },
                exclude: /node_modules/
            }
        ]
    },

    plugins: [
        new cleanWebpackPlugin("build/main.js")
    ]
}