import express from 'express';
import bodyParser from 'body-parser';
// import proxy from 'express-http-proxy';
import passport from 'passport';
import auth from './auth';
import api from './api';

const app = express();

/** Register Middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());

/** Auth API */
app.use(auth);

/** REST API */
app.use('/api', api);

/** Mongo-Express UI */
// Move this out to initialization logic
// app.use('/', proxy('localhost:27018'));

export default app;
