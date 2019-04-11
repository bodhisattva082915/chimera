const nodeExternals = require('webpack-node-externals');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const NodemonPlugin = require('nodemon-webpack-plugin');

const server = {
	name: 'server',
	mode: process.env.NODE_ENV || 'production',
	entry: './src/app.js',
	target: 'node',
	node: {
		__filename: true,
		__dirname: true
	},
	output: {
		libraryExport: 'default',
		libraryTarget: 'umd'
	},
	externals: [nodeExternals()],
	optimization: {
		minimizer: [
			new UglifyJsPlugin({
				uglifyOptions: {
					keep_fnames: true
				}
			})
		]
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					'babel-loader',
					'eslint-loader'
				]
			}
		]
	},
	plugins: [
		new NodemonPlugin({
			script: './index.js'
		})
	]
};

const clients = {
	name: 'clients',
	mode: process.env.NODE_ENV || 'production',
	entry: {
		auth: './assets/auth/index.js'
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					'babel-loader',
					'eslint-loader'
				]
			},
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
				use: [
					'file-loader'
				]
			}
		]
	},
	output: {
		filename: '[name].js'
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: './assets/template.html',
			filename: 'auth.html',
			chunks: ['auth'],
			title: 'Chimera Authentication',
			meta: {
				description: 'Responsible for authenticating users for acess into all other Chimera applications.'
			}
		})
	],
	devServer: {
		port: 9000,
		index: 'auth.html',
		compress: true,
		historyApiFallback: { index: '/' }
	}
};

module.exports = [
	/**
	 * Configuration 'clients' should be exported first since devServer can only be
	 * configured on the first webpack configuration when exporting multiple configurations.
	 * https://webpack.js.org/configuration/dev-server#devserver
	 */
	clients,
	server
];
