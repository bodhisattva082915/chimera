import mongoose from 'mongoose';
import pick from 'lodash/pick';
import isEmail from 'validator/lib/isEmail';
import isMobilePhone from 'validator/lib/isMobilePhone';
import isUUID from 'validator/lib/isUUID';
import { isMobilePhoneLocales } from 'validator';

export class Email extends mongoose.SchemaType {
	constructor (...args) {
		super(...args, 'Email');
	}

	cast (val) {
		const _val = String(val);

		if (!isEmail(_val)) {
			throw new Error(`${_val} is not a valid email address.`);
		}

		return _val;
	}
}

export class Phone extends mongoose.SchemaType {
	constructor (...args) {
		const _opts = args[1];
		const locales = isMobilePhoneLocales;

		if (_opts.locale) {
			let isValidLocale;
			if (Array.isArray(_opts.locale)) {
				isValidLocale = _opts.locale.every(locale => locales.includes(locale));
			} else {
				isValidLocale = locales.includes(_opts.locale);
			}

			if (!isValidLocale) {
				throw new Error(`${_opts.locale} is not a valid locale value for SchemaType Phone. [${isMobilePhoneLocales.join(',')}]`);
			}
		}

		super(...args, 'Phone');
	}

	cast (val) {
		const _val = String(val);
		const _validatorOpts = pick(this.options, ['strictMode']);

		if (!isMobilePhone(_val, this.options.locale || null, _validatorOpts)) {
			throw new Error(`${_val} is not a valid ${this.options.locale + ' ' || ''}phone number.`);
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

		super(...args, 'UUID');
	}

	cast (val) {
		const _val = String(val);

		if (this.options.version) {
			if (!isUUID(_val, this.options.version)) {
				throw new Error(`${_val} is not a valid v${this.options.version} UUID.`);
			}
		} else {
			if (!isUUID(_val)) {
				throw new Error(`${_val} is not a valid UUID.`);
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
	Phone,
	UUID,
	Uuid: UUID // Alias needed to support lowercase values ({ uuidField: 'uuid' })
};
