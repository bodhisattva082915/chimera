import ChimeraSchema from '../schema';

const Hierarchical = new ChimeraSchema('HierarchicalAssociation', {
	many: {
		type: Boolean,
		default: true,
		description: `Specifies whether this association will act as a 'one-to-many' or 'one-to-one' relationship.`
	}
});

export default Hierarchical;
