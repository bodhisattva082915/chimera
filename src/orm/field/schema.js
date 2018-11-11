import jsonSchemaDraft07 from 'ajv/lib/refs/json-schema-draft-07.json';

export default {
	$schema: 'http://json-schema.org/draft-07/schema#',
	title: 'Chimera Field',
	description: 'Validates data as a JSON Schema property.',
	definitions: jsonSchemaDraft07.definitions,
	type: 'object',
	properties: {
		name: {
			type: 'string'
		},
		modelId: {
			type: 'string',
			format: 'uuid'
		},
		...jsonSchemaDraft07.properties
	},
	required: [
		'modelId',
		'name'
	]
};
