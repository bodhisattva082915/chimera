import factory from 'factory-girl';
import ChimeraModel from 'app/orm/model';

factory.define(ChimeraModel.modelName, ChimeraModel, {
	name: factory.chance('word')
});
