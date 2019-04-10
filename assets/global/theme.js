import 'typeface-roboto';
import './styles.css';
import * as Colors from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

const chimeraTheme = createMuiTheme({
	typography: {
		useNextVariants: true
	},
	palette: {
		primary: {
			main: Colors.red[800],
			light: Colors.red[600],
			dark: Colors.red[900]
		},
		secondary: {
			main: Colors.deepPurple[600],
			light: Colors.deepPurple[400],
			dark: Colors.deepPurple[800]
		},
		background: {
			default: '#fff'
		}
	},
	overrides: {
		MuiButton: {
			root: {
				borderRadius: 0
			},
			contained: {
				boxShadow: 'none'
			}
		}
	}
});

export default chimeraTheme;
