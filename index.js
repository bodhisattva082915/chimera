const proxy = require('express-http-proxy');
const app = require('./dist/main.js');

if (process.env.NODE_ENV === 'development') {
	app.use('/mongo-admin', proxy('localhost:8081'));
}

app.listen(8000, err => {
	if (err) {
		console.error(err);
	}

	console.info('Chimera running at port 8000...');
});
