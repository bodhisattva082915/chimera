import ChimeraModel from './model';
import store from './store';

const ontology = [ChimeraModel];

ontology.forEach(resource => {
	const { name, ...opts } = resource;
	const mapper = store.defineMapper(name, opts);

	store.models = {
		...store.models,
		[name]: mapper
	};
});

export default store;
