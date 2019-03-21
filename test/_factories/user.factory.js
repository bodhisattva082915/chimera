import factory from 'factory-girl';
import orm from 'app/orm';

const model = orm.model('User');

factory.define(model.modelName, model, {
	username: factory.chance('email', { domain: 'example.com' }),
	password: factory.chance('word', { length: 12 })
});
