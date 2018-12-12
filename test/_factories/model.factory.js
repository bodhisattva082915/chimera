import factory from 'factory-girl';
import orm from 'app/orm';

const model = orm.model('ChimeraModel');

factory.define(model.modelName, model, {
	name: factory.chance('word')
});
