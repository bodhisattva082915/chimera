export default {
	$schema: 'http://json-schema.org/draft-07/schema#',
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
};
