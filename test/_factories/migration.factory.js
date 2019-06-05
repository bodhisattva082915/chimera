import factory from 'factory-girl';
import orm from 'chimera/orm';

const model = orm.model('chimera.orm.migration');

factory.define(model.modelName, model, {
	name: factory.chance('word', { length: 5 })
});
