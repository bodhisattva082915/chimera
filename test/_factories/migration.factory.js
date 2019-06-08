import factory from 'factory-girl';
import orm from 'chimera/orm';

const migration = orm.model('chimera.orm.migration');
const migrationTemplate = orm.model('chimera.orm.migrationTemplate');

const common = {
	package: factory.chance('word', { length: 5 }),
	module: factory.chance('word', { length: 5 }),
	name: factory.chance('word', { length: 5 })
};

factory.define(migration.modelName, migration, common);
factory.define(migrationTemplate.modelName, migrationTemplate, {
	...common
});
