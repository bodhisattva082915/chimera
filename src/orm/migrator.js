import pickBy from 'lodash/pickBy';
import zipObject from 'lodash/zipObject';

class Migrator {
	constructor (orm, config = {}) {
		this.orm = orm;
		this.filter = config.filter || {};
		this.logging = config.logging !== false;
		this.Migration = orm.model('chimera.orm.migration');
	}

	async run (options = {}) {
		const direction = options.backwards ? 'backwards' : 'forwards';
		const migrations = await this._loadMigrations(this.filter);
		const migrationEvents = {};
		const migrationErrors = {};

		let migrating = true;
		while (migrating) {
			let executed = await this.Migration.find();
			let toExecute = migrations
				.filter(migration => !Object.keys(migrationErrors).includes(migration.namespace))
				.filter(this._toMigrateFilter(direction, executed));

			if (toExecute.length) {
				let executing = toExecute.reduce((acc, migration) => ({
					...acc,
					[migration.namespace]: (async () => {
						if (this.logging) {
							console.log(`${direction === 'forwards' ? 'Migrating' : 'Reversing'} ${migration.namespace}...`);
						}
						return migration[direction] && migration[direction] instanceof Function
							? migration[direction]()
							: Promise.resolve();
					})().catch(err => Promise.resolve(err))
				}), {});

				Object.assign(executing, zipObject(
					Object.keys(executing),
					await Promise.all(Object.values(executing))
				));

				const successes = pickBy(executing, result => !(result instanceof Error));
				const errors = pickBy(executing, result => result instanceof Error);
				const events = await this._postMigrationHandler(direction, executed, toExecute.filter(migration =>
					Object.keys(successes).includes(migration.namespace)
				));

				Object.assign(migrationEvents, zipObject(Object.keys(successes), events));
				Object.assign(migrationErrors, zipObject(Object.keys(errors), errors));
			} else {
				migrating = false;
			}
		}

		return {
			successes: migrationEvents,
			errors: migrationErrors
		};
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
			return this.Migration.create(currentlyExecuted.map(migration => {
				delete migration[this.Migration.schema.options.discriminatorKey];
				return migration;
			}));
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
