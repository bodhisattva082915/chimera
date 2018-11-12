import { Schema } from 'js-data';

export default new Schema({
	title: 'Chimera Field',
	description: 'Schema document for Chimera models. Should emulate JSON Schema property syntax.',
	type: 'object',
	properties: {
		name: {
			type: 'string'
		},
		modelId: {
			type: 'string'
		}
	},
	required: [
		'modelId',
		'name'
	]
});
