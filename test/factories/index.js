import fs from 'fs';

fs
	.readdirSync(__dirname)
	.filter(file => file.includes('factory'))
	.forEach(factory => require(`${__dirname}/${factory}`));
