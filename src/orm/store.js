import 'env';
import { Container } from 'js-data';
import { MongoDBAdapter } from 'js-data-mongodb';

const store = new Container();
const adapter = new MongoDBAdapter({
	uri: 'mongodb://' +
		`${process.env.NODE_ENV !== 'test' ? process.env.CHIMERADB_USERNAME + ':' : ''}` +
		`${process.env.NODE_ENV !== 'test' ? process.env.CHIMERADB_PASSWORD + '@' : ''}` +
		`${process.env.CHIMERADB_HOST}:` +
		`${process.env.CHIMERADB_PORT}/` +
		`${process.env.CHIMERADB_NAME}`
});

store.registerAdapter('mongo', adapter, {
	default: true
});

export default store;
