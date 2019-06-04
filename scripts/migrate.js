const app = require('./dist/main.js');

(async function () {
	await app.init();
	await app.orm.migrate();
})();
