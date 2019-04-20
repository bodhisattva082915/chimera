import React from 'react';
import { Switch, Route } from 'react-router-dom';
import IndexView from './IndexView';
import PasswordResetView from './PasswordResetView';

const routes = () =>
	<Switch>
		<Route path="/" exact component={IndexView} />
		<Route path="/password-reset" component={PasswordResetView} />
	</Switch>;

export default routes;
