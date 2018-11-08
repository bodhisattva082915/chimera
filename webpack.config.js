const path = require('path');
const nodeExternals = require('webpack-node-externals');
const NodemonPlugin = require('nodemon-webpack-plugin');

module.exports = {
	mode: process.env.NODE_ENV || 'production',
	target: 'node',
	node: {
		__filename: true,
		__dirname: true
	},
	resolve: {
		alias: {
			'app': path.resolve(__dirname, 'src'),
			'env': path.resolve(__dirname, 'env')
		}
	},
	externals: [nodeExternals()],
	plugins: [
		new NodemonPlugin()
	],
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'eslint-loader'
			}
		]
	}
};
