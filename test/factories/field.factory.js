import factory from 'factory-girl';
import ChimeraField from 'app/orm/field/class';

factory.define(ChimeraField.name, ChimeraField, {
	modelId: factory.assoc('ChimeraModel', '_id'),
	name: factory.chance('word'),
	type: 'string'
});
