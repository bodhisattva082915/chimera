import fs from 'fs';
import factory, { MongooseAdapter } from 'factory-girl';

factory.setAdapter(new MongooseAdapter());

fs
	.readdirSync(__dirname)
	.filter(file => file.includes('factory'))
	.forEach(factory => require(`${__dirname}/${factory}`));
