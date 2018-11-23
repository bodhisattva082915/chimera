import fs from 'fs';

fs
	.readdirSync(__dirname)
	.filter(file => !file.includes('.js'))
	.forEach(model => {
		const cls = require(`${__dirname}/${model}`).default;

		cls.associate();
	});
