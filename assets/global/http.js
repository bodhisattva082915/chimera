import axios from 'axios';

const http = axios.create({
	baseURL: '/api',
	headers: {
		'X-Requested-With': 'XMLHttpRequest'
	},
	timeout: process.env.NODE_ENV !== 'production' ? 0 : 10000
});

export default http;
