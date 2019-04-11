import express from 'express';
import bodyParser from 'body-parser';
import passport from 'passport';
import path from 'path';
import context from './httpContext';
import auth from './auth';
import api from './api';

const app = express();

/** Register Middleware */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(context.initialize());

/** Auth API */
// app.use(auth);

/** REST API */
app.use('/api', [auth, api]);

/** Serves static files from 'public' */
app.use('/public', express.static('public'));
app.use('/', (req, res) => res.sendFile(path.resolve('./public/auth.html')));

export default app;
