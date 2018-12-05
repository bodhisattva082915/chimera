import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail';

export class Email extends mongoose.SchemaType {
	cast (val) {
		const _val = String(val);

		if (!isEmail(_val)) {
			throw new Error(`${_val} is not a valid email address`);
		}

		return _val;
	}
}

mongoose.Schema.Types = {
	...mongoose.Schema.Types,

	// Custom Chimera Types
	Email
};
