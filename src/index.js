import express from 'express';
import proxy from 'express-http-proxy';
import passport from 'passport';
import auth from './auth';
import api from './api';

const app = express();

/** Register Middleware */
app.use(passport.initialize());

/** Auth API */
app.use('/auth', auth);

/** REST API */
app.use('/api', api);

/** Mongo-Express UI */
app.use('/', proxy('localhost:27018'));

export default app;
