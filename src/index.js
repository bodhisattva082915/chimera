import express from 'express';
import proxy from 'express-http-proxy';
import { queryParser, Router } from 'js-data-express';
import store from './orm';

const app = express();

app.use('/api', queryParser);
app.use('/api', new Router(store).router);

/* Mongo-Express UI */
app.use('/', proxy('localhost:27018'));

app.listen(3000, () => {
	console.log('Chimera watching on port 3000');
});
