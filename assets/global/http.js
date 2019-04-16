import axios from 'axios';

const http = axios.create({
	baseURL: '/api',
	headers: {
		'X-Requested-With': 'XMLHttpRequest'
	},
	timeout: 10000
});

export default http;
