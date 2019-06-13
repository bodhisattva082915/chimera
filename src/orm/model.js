import Model from 'mongoose/lib/model';

class PrototypeModel extends Model {

	static create (doc, options, callback) {
		const defaultSession = this.base.options.defaultSession;
		const session = options ? options.session : undefined;
		if (defaultSession && !session) {
			options = {
				...options,
				session: defaultSession
			};
		}
		return super.create(doc, options, callback);
	}
}

export default PrototypeModel;
