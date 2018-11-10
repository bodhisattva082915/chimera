import ChimeraModel from './model';
import ChimeraField from './field';
import ChimeraMapper from './mapper';
import store from './store';

const ontology = [
	ChimeraModel,
	ChimeraField
];

ontology.forEach(resource => {
	store.defineMapper(resource.collection, {
		mapperClass: ChimeraMapper,
		...resource
	});
});

export default store;
