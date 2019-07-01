import Model from 'mongoose/lib/model';
import { withDefaultSession } from './utils';

/**
 * Enhances upon the standard mongoose model by:
 * TODO: Override further options that require default setssion.
 * * Injecting a default session into standard CRUD operations, if one exists
 */
class PrototypeModel extends Model {

	static create (doc, options, callback) {
		options = withDefaultSession(options, this.base.options.defaultSession);
		return super.create(doc, options, callback);
	}
}

export default PrototypeModel;
