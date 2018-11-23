import 'env';
import mongoose from 'mongoose';
import uniqueValidator from 'mongoose-unique-validator';
import associations from './orm/associations';

mongoose.plugin(uniqueValidator);
mongoose.plugin(associations);

export default mongoose
	.connect(
		'mongodb://' +
		`${process.env.NODE_ENV !== 'test' ? process.env.CHIMERADB_USERNAME + ':' : ''}` +
		`${process.env.NODE_ENV !== 'test' ? process.env.CHIMERADB_PASSWORD + '@' : ''}` +
		`${process.env.CHIMERADB_HOST}:` +
		`${process.env.CHIMERADB_PORT}/` +
		`${process.env.CHIMERADB_NAME}`, {
			useNewUrlParser: true,
			useCreateIndex: true
	})
	.catch(console.error);
