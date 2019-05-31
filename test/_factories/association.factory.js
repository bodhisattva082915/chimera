import factory from 'factory-girl';
import orm from 'chimera/orm';

const Hierarchical = orm.model('chimera.orm.hierarchicalAssociation');
const NonHierarchical = orm.model('chimera.orm.nonHierarchicalAssociation');

const common = {
	fromModelId: factory.assoc('chimera.orm.model', '_id'),
	toModelId: factory.assoc('chimera.orm.model', '_id'),
	fromModel: {
		reverseName: factory.chance('word', { length: 5 })
	},
	toModel: {
		foreignKey: factory.chance('word', { length: 5 }),
		relatedName: factory.chance('word', { length: 5 })
	}
};

factory.define(Hierarchical.modelName, Hierarchical, {
	...common
});

factory.define(NonHierarchical.modelName, NonHierarchical, {
	...common,
	fromModel: {
		...common.fromModel,
		foreignKey: factory.chance('word', { length: 5 }),
		relatedName: factory.chance('word', { length: 5 })
	},
	toModel: {
		...common.toModel,
		reverseName: factory.chance('word', { length: 5 })
	}
});
