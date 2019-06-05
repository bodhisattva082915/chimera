import factory from 'factory-girl';
import orm from 'chimera/orm';

const model = orm.model('chimera.orm.migration');

factory.define(model.modelName, model, {
	package: factory.chance('word', { length: 5 }),
	module: factory.chance('word', { length: 5 }),
	name: factory.chance('word', { length: 5 })
});
