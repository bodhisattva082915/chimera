
class Migrator {
	constructor (orm, config = {}) {
		this.filter = config.filter || {};
		this.logging = config.logging !== false;
		this.Migration = orm.model('chimera.orm.migration');
	}

	async run (options = {}) {
		const direction = options.backwards ? 'backwards' : 'forwards';
		const migrations = await this._loadMigrations(this.filter);
		const migrationsRan = [];

		let invocationsFilter;
		let invocationsSuccessHandler;
		if (direction === 'forwards') {
			invocationsFilter = migration => {
				if (executed.find(e => e.namespace === migration.namespace)) {
					return false;
				};

				if (!migration.dependsOn.every(dep => executed.find(e => e.namespace === dep))) {
					return false;
				}

				return true;
			};
			invocationsSuccessHandler = async migrations => {
				const invoked = await this.Migration.create(migrations);

				executed.push(...invoked);
				migrationsRan.push(...invoked);
			};
		} else {
			invocationsFilter = migration => {
				if (!executed.find(e => e.namespace === migration.namespace)) {
					return false;
				};

				if (executed.find(e => e.dependsOn.includes(migration.namespace))) {
					return false;
				}

				return true;
			};
			invocationsSuccessHandler = async migrations => {
				const toDelete = executed.filter(e => migrations.map(m => m.namespace).includes(e.namespace));
				await this.Migration.deleteMany({
					_id: {
						$in: toDelete.map(d => d.id)
					}
				});

				executed = executed.filter(e => !toDelete.map(d => d.id).includes(e.id));
				migrationsRan.push(...toDelete);
			};
		}

		let executed = await this.Migration.find();
		let migrating = true;

		while (migrating) {
			let toInvoke = migrations.filter(invocationsFilter);

			let invoking = toInvoke
				.map(async migration => {
					if (this.logging) {
						console.log(`${direction === 'forwards' ? 'Migrating' : 'reversing'} ${migration.namespace}...`);
					}

					return migration[direction] && migration[direction] instanceof Function
						? migration[direction]()
						: Promise.resolve();
				});

			if (invoking.length) {
				await Promise.all(invoking);
				await invocationsSuccessHandler(toInvoke);
			} else {
				migrating = false;
			}
		}

		return migrationsRan;
	}

	async _loadMigrations () {

	}
}

export default Migrator;
