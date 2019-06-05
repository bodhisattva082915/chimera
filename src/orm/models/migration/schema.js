import ChimeraSchema from '../../schema';

const schema = new ChimeraSchema('Migration', {
	package: {
		type: String,
		required: true
	},
	module: {
		type: String,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	description: {
		type: String
	},
	dependsOn: {
		type: [String],
		set (value) {
			return !Array.isArray(value) ? [value] : value;
		}
	},
	namespace: {
		type: String,
		get () {
			return [this.package, this.module, this.name].filter(x => x).join('.');
		},
		set (value) {
			const [packageName, module, name] = value.split('.');

			this.package = packageName;
			this.module = module;
			this.name = name;
		}
	}
})

	/** Indexing */
	.index({ package: 1, module: 1, name: 1 }, { unique: true });

export default schema;
