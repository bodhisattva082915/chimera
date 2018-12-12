import factory from 'factory-girl';
import orm from 'app/orm';

const model = orm.getModel('ChimeraAssociation');

factory.define(model.modelName, model, {
	fromModelId: factory.assoc('ChimeraModel', '_id'),
	toModelId: factory.assoc('ChimeraModel', '_id')
});
