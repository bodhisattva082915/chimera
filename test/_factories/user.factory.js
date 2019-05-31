import factory from 'factory-girl';
import orm from 'chimera/orm';

const model = orm.model('chimera.auth.user');

factory.define(model.modelName, model, {
	username: factory.chance('word', { length: 8 }),
	password: factory.chance('word', { length: 12 }),
	email: factory.chance('email', { domain: 'example.com' }),
	verified: true
});
