import { Container } from 'js-data'
import { MongoDBAdapter } from 'js-data-mongodb';

const store = new Container({
	mapperDefaults: {
		idAttribute: '_id'
	}
});

const adapter = new MongoDBAdapter({
	/** TODO: Build connection URI from env */
	uri: 'mongodb://chimeraAdmin:chimeraSecret@localhost/chimera',
});

store.registerAdapter('mongo', adapter, {
	default: true
});

export default store;