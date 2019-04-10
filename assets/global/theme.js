import 'typeface-roboto';
import './styles.css';
import { createMuiTheme } from '@material-ui/core/styles';

const chimeraTheme = createMuiTheme({
	typography: {
		useNextVariants: true
	},
	palette: {
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
