
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
			let toInvoke = migrations.filter(this._toMigrateFilter(direction, executed));

			let invoking = toInvoke
				.map(async migration => {
					if (this.logging) {
						console.log(`${direction === 'forwards' ? 'Migrating' : 'Reversing'} ${migration.namespace}...`);
					}

					return migration[direction] && migration[direction] instanceof Function
						? migration[direction]()
						: Promise.resolve();
				});

			if (invoking.length) {
				await Promise.all(invoking);
				const results = await this._postMigrationHandler(direction, executed, toInvoke);
				migrationEvents.push(...results);
			} else {
				migrating = false;
			}
		}

		return migrationEvents;
	}

	async _loadMigrations () {

	}

	_toMigrateFilter (direction, executed) {
		if (direction === 'forwards') {
			return migration => {
				if (executed.find(e => e.namespace === migration.namespace)) {
					return false;
				};

				if (!migration.dependsOn.every(dep => executed.find(e => e.namespace === dep))) {
					return false;
				}

				return true;
			};
		} else {
			return migration => {
				if (!executed.find(e => e.namespace === migration.namespace)) {
					return false;
				};

				if (executed.find(e => e.dependsOn.includes(migration.namespace))) {
					return false;
				}

				return true;
			};
		}
	}

	async _postMigrationHandler (direction, executed, invoked) {
		if (direction === 'forwards') {
			const tracked = await this.Migration.create(invoked);

			return tracked;
		} else {
			const untracked = executed.filter(e => invoked.map(m => m.namespace).includes(e.namespace));
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
