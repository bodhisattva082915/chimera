import path from 'path';
import dotenv from 'dotenv-extended';

const env = dotenv.load({
	path: path.resolve(__dirname, '.env'),
	defaults: path.resolve(__dirname, '.env.defaults'),
	schema: path.resolve(__dirname, '.env.schema'),
	overrideProcessEnv: true,
	debug: process.env.NODE_ENV !== 'production'
});

export default env;
