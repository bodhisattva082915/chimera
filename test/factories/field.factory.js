import factory from 'factory-girl';
import ChimeraField from 'app/orm/field';

factory.define('ChimeraField', ChimeraField, {
	modelId: factory.assoc('ChimeraModel', '_id'),
	name: factory.chance('word'),
	type: 'string'
});
