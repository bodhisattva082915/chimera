const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PUBLIC = '/public';

module.exports = {
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
					{
						loader: 'file-loader',
						options: {
							publicPath: PUBLIC
						}
					}
				]
			}
		]
	},
	output: {
		path: path.resolve(__dirname, './public'),
		publicPath: PUBLIC,
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
		contentBase: path.resolve('./public'),
		compress: true,
		historyApiFallback: {
			rewrites: [
				{ from: /^\/auth/, to: '/public/auth.html' }
			]
		}
	}
};
