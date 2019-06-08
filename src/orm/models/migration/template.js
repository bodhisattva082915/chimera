import ChimeraSchema from '../../schema';

const MigrationTemplate = new ChimeraSchema('MigrationTemplate', {
	description: String,
	dependsOn: {
		type: [String],
		set (value) {
			return !Array.isArray(value) ? [value] : value;
		}
	},
	forwards: String,
	backwards: String
});

export default MigrationTemplate;
