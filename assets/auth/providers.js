import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { MuiThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../global/theme';

const RootProviders = props =>
	<MuiThemeProvider theme={theme}>
		<Router basename="/auth">
			<CssBaseline />
			{props.children}
		</Router>
	</MuiThemeProvider>;

export default RootProviders;
