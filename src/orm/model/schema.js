import { Schema } from 'js-data';

export default new Schema({
	title: 'Chimera Model',
	description: 'Schema document for Chimera models.',
	type: 'object',
	properties: {
		'module': {
			'type': 'string'
		},
		'name': {
			'type': 'string'
		}
	},
	required: [
		'name'
	]
});
