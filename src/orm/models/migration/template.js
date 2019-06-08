import ChimeraSchema from '../../schema';

const MigrationTemplate = new ChimeraSchema('MigrationTemplate', {
	description: String,
	dependsOn: {
		type: [String],
		set (value) {
			return !Array.isArray(value) ? [value] : value;
		}
	}
});

export default MigrationTemplate;
