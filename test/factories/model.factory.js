import factory from 'factory-girl';
import ChimeraModel from 'app/orm/model/class';

factory.define(ChimeraModel.name, ChimeraModel, {
	name: factory.chance('word')
});
