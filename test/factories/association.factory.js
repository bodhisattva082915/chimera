import factory from 'factory-girl';
import ChimeraAssociation from 'app/orm/association';

factory.define('ChimeraAssociation', ChimeraAssociation, {
	fromModelId: factory.assoc('ChimeraModel', '_id'),
	toModelId: factory.assoc('ChimeraModel', '_id')
});
