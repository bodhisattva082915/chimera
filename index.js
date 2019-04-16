const app = require('./dist/main.js');

if (process.env.NODE_ENV === 'development') {
	const mongoExpress = require('mongo-express/lib/middleware');
	const config = require('mongo-express/config.default');

	config.mongodb.admin = true;
	config.mongodb.adminUsername = 'root';
	config.mongodb.adminPassword = 'root';
	config.basicAuth.username = 'chimeraAdmin';
	config.basicAuth.password = 'chimeraAdmin';

	app.use('/mongo-express', mongoExpress(config));
}

app.listen(8000, err => {
	if (err) {
		console.error(err);
	}

	console.info('Chimera running at port 8000...');
});
