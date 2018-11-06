const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require( 'nodemon-webpack-plugin' )

module.exports = {
    mode: process.env.NODE_ENV || 'production',
    target: 'node',
    externals: [nodeExternals()],
    plugins: [
        new NodemonPlugin()
    ]
}