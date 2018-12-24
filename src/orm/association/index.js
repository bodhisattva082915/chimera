
import hierarchical from './hierarchical';
import nonHierarchical from './nonHierarchical';

export { default as schema } from './schema';

export const discriminators = {
	[hierarchical.name]: hierarchical,
	[nonHierarchical.name]: nonHierarchical
};
