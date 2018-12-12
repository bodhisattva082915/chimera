import factory from 'factory-girl';
import orm from 'app/orm';

const model = orm.getModel('ChimeraModel');

factory.define(model.modelName, model, {
	name: factory.chance('word')
});
