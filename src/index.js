import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import context from './context';
import auth from './auth';
import api from './api';

const app = express();

/** Register Middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(context.initialize());

/** Auth API */
app.use(auth);

/** REST API */
app.use('/api', api);

/** Init conxtext for cross-scope request access */

/** Mongo-Express UI */
// Move this out to initialization logic
// import proxy from 'express-http-proxy';
// app.use('/', proxy('localhost:27018'));

export default app;
