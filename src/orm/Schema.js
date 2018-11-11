import Ajv from 'ajv';
import { Schema } from 'js-data';

const ajv = new Ajv({
	allErrors: true
});

class ChimeraSchema extends Schema {
	constructor (definition) {
		super(definition);
		this.validator = ajv.compile(definition);
	}

	validate (value, opts) {
		const isValid = this.validator(value);

		if (!isValid) {
			return this.validator.errors;
		}
	}
}

export default ChimeraSchema;
