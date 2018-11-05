const nodeExternals = require('webpack-node-externals');

module.exports = {
    mode: process.env.NODE_ENV || 'production',
    target: 'node',
    externals: [nodeExternals()]
}