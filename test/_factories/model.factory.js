import factory from 'factory-girl';
import get from 'lodash/get';
import orm from 'app/orm';

const model = orm.model('ChimeraModel');

factory.define(model.modelName, model, {
	name: factory.chance('word', { length: 5 })
}, {
	afterCreate: async (model, attrs, buildOptions) => {
		const fields = get(buildOptions, 'autoCreate.fields', 3);
		if (fields !== false) {
			await factory.createMany('ChimeraField', fields, {
				chimeraModelId: model.id
			});
		}

		return model;
	}
});
