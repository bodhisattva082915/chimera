const proxy = require('express-http-proxy');
const app = require('./dist/main.js');

app.listen(3000, err => {
	if (err) {
		console.error(err);
	}

	console.info('Chimera running at port 3000...');
});
