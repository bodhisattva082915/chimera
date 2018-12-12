import factory from 'factory-girl';
import orm from 'app/orm';

const model = orm.model('ChimeraField');

factory.define(model.modelName, model, {
	chimeraModelId: factory.assoc('ChimeraModel', '_id'),
	name: factory.chance('word'),
	type: 'String'
});
