import fs from 'fs';

fs
	.readdirSync(__dirname)
	.filter(file => !file.includes('.js'))
	.filter(file => !file.includes('plugins'))
	.forEach(model => {
		require(`${__dirname}/${model}`);
	});
