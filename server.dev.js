const path = require("path")
const webpack = require('webpack')
const webpackDevMiddleware = require('webpack-dev-middleware')
const webpackHotMiddleware = require('webpack-hot-middleware')
const config = require('./webpack.config')

config.plugins.push(
    new webpack.DefinePlugin({
        'golbalEnv': {
            NODE_ENV: JSON.stringify('development')
        }
    })
)

const express = require('express')
const app = new express();
const port = require("./config.json").port

const temp = webpack(config)

app.use(webpackDevMiddleware(temp, {
    publicPath: config.output.publicPath,
    stats: {
        colors: true,
        chunks: false
    }
}))

app.use(webpackHotMiddleware(temp))

app.use('/', express.static(`${__dirname}/src/public`))

app.listen(port, error => {
    if (error) {
        console.error(error)
    } else {
        console.info('Listening on port %s', port)
    }
})