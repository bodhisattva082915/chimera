import fs from 'fs';
import mongoose from 'mongoose';
import jsonschemaSupport from 'mongoose-schema-jsonschema';

jsonschemaSupport(mongoose);

fs
	.readdirSync(__dirname)
	.filter(file => !file.includes('.js'))
	.filter(file => !file.includes('plugins'))
	.forEach(model => {
		require(`${__dirname}/${model}`);
	});
