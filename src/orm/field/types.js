import mongoose from 'mongoose';
import isEmail from 'validator/lib/isEmail';
import isUUID from 'validator/lib/isUUID';

export class Email extends mongoose.SchemaType {
	cast (val) {
		const _val = String(val);

		if (!isEmail(_val)) {
			throw new Error(`${_val} is not a valid email address`);
		}

		return _val;
	}
}

export class UUID extends mongoose.SchemaType {
	constructor (...args) {
		const _opts = args[1];
		const versions = [3, 4, 5];

		if (_opts.version && !versions.includes(_opts.version)) {
			throw new Error(`${_opts.version} is not a valid version value for SchemaType UUID. [${versions.join(',')}]`);
		}

		super(...args);
	}

	cast (val) {
		const _val = String(val);

		if (this.options.version) {
			if (!isUUID(_val, this.options.version)) {
				throw new Error(`${_val} is not a valid v${this.options.version} UUID`);
			}
		} else {
			if (!isUUID(_val)) {
				throw new Error(`${_val} is not a valid UUID`);
			}
		}
	}
}

/**
 * TODO: Other types to support natively
 * * Currency
 * * Postal Code
 * * Phone
 * * IP Address
 * * URL
 * * Function Fields
 */

mongoose.Schema.Types = {
	...mongoose.Schema.Types,

	/* Custom Chimera Types */
	Email,
	UUID,
	Uuid: UUID // Alias needed to support lowercase values ({ uuidField: 'uuid' })
};
