import uniqueValidator from 'mongoose-unique-validator';
import ORM from './orm';

const orm = new ORM({
	staticModules: ['auth']
});

/**
 * Global Third-Party Plugins
 */
orm.plugin(uniqueValidator);

export { ORM };
export default orm;
