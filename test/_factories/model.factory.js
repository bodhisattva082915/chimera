import factory from 'factory-girl';
import get from 'lodash/get';
import orm from 'chimera/orm';

const model = orm.model('chimera.orm.model');

factory.define(model.modelName, model, {
	name: factory.chance('word', { length: 5 })
}, {
	afterCreate: async (model, attrs, buildOptions) => {
		const fields = get(buildOptions, 'autoCreate.fields', 3);
		if (fields !== false) {
			await factory.createMany('chimera.orm.field', fields, {
				chimeraModelId: model.id
			});
		}

		return model;
	}
});
