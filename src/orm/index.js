import fs from 'fs';

fs
	.readdirSync(__dirname)
	.filter(file => !file.includes('.js'))
	.forEach(model => {
		require(`${__dirname}/${model}`);
	});
