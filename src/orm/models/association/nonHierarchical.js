import ChimeraSchema from '../../schema';

const NonHierarchical = new ChimeraSchema('NonHierarchicalAssociation', {})
	.belongsTo('ChimeraModel', {
		localField: 'throughModelId',
		as: 'through'
	});

export default NonHierarchical;
