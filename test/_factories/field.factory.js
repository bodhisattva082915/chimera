import factory from 'factory-girl';
import orm from 'chimera/orm';

const model = orm.model('chimera.orm.field');

factory.define(model.modelName, model, {
	chimeraModelId: factory.assoc('chimera.orm.model', '_id'),
	name: factory.chance('word', { length: 5 }),
	type: 'String'
});
