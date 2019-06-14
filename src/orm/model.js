import Model from 'mongoose/lib/model';

/**
 * Enhances upon the standard mongoose model by:
 * * Injecting a default session into standard CRUD operation, if one exists
 */
class PrototypeModel extends Model {

	static create (doc, options, callback) {
		options = withDefaultSession(options, this.base.options.defaultSession);
		return super.create(doc, options, callback);
	}

	save (options, fn) {
		options = withDefaultSession(options, this.base.options.defaultSession);
		return super.save(options, fn);
	}
}

function withDefaultSession (options, defaultSession) {
	const session = options ? options.session : undefined;
	if (defaultSession && !session) {
		options = {
			...options,
			session: defaultSession
		};
	}

	return options;
}

export default PrototypeModel;
