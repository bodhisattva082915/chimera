
import oneToMany from './oneToMany';
import oneToOne from './oneToOne';
import manyToMany from './manyToMany';

export { default as schema } from './schema';

export const discriminators = {
	ChimeraOneToMany: oneToMany,
	ChimeraOneToOne: oneToOne,
	ChimeraManyToMany: manyToMany
};
