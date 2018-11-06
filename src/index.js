import express from "express";
import { queryParser, Router } from 'js-data-express';
import store from './orm/store';

const app = express();

store.defineMapper('_initdb');

app.use('/api', queryParser);
app.use('/api', new Router(store).router);

app.listen(3000, () => {
    console.log('Chimera watching on port 3000');
});