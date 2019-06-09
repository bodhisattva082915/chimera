
class Migrator {
	constructor (orm, config = {}) {
		this.filter = config.filter || {};
		this.logging = config.logging !== false;
		this.Migration = orm.model('chimera.orm.migration');
	}

	async run (options = {}) {
		const direction = options.backwards ? 'backwards' : 'forwards';
		const migrations = await this._loadMigrations(this.filter);
		const migrationEvents = [];

		let migrating = true;
		while (migrating) {
			let executed = await this.Migration.find();
			let toExecute = migrations.filter(this._toMigrateFilter(direction, executed));
			let executing = toExecute
				.map(async migration => {
					if (this.logging) {
						console.log(`${direction === 'forwards' ? 'Migrating' : 'Reversing'} ${migration.namespace}...`);
					}

					return migration[direction] && migration[direction] instanceof Function
						? migration[direction]()
						: Promise.resolve();
				});

			if (executing.length) {
				await Promise.all(executing);
				const results = await this._postMigrationHandler(direction, executed, toExecute);
				migrationEvents.push(...results);
			} else {
				migrating = false;
			}
		}

		return migrationEvents;
	}

	async _loadMigrations () {

	}

	_toMigrateFilter (direction, previouslyExecuted) {
		if (direction === 'forwards') {
			return migration => {
				if (previouslyExecuted.find(e => e.namespace === migration.namespace)) {
					return false;
				};

				if (!migration.dependsOn.every(dep => previouslyExecuted.find(e => e.namespace === dep))) {
					return false;
				}

				return true;
			};
		} else {
			return migration => {
				if (!previouslyExecuted.find(e => e.namespace === migration.namespace)) {
					return false;
				};

				if (previouslyExecuted.find(e => e.dependsOn.includes(migration.namespace))) {
					return false;
				}

				return true;
			};
		}
	}

	async _postMigrationHandler (direction, previouslyExecuted, currentlyExecuted) {
		if (direction === 'forwards') {
			return this.Migration.create(currentlyExecuted);
		} else {
			const untracked = previouslyExecuted.filter(e => currentlyExecuted.map(m => m.namespace).includes(e.namespace));
			await this.Migration.deleteMany({
				_id: {
					$in: untracked.map(d => d.id)
				}
			});
			return untracked;
		}
	}
}

export default Migrator;
