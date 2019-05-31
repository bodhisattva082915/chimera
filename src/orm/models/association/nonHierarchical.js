import ChimeraSchema from '../../schema';

const NonHierarchical = new ChimeraSchema('NonHierarchicalAssociation', {})
	.belongsTo('chimera.orm.model', {
		localField: 'throughModelId',
		as: 'through'
	});

export default NonHierarchical;
