import express from 'express';
import proxy from 'express-http-proxy';
import './db';
import './orm';
import api from './api';

const app = express();

/* REST API */
app.use('/api', api);

/* Mongo-Express UI */
app.use('/', proxy('localhost:27018'));

app.listen(3000, () => {
	console.log('Chimera watching on port 3000');
});
