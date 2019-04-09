import 'typeface-roboto';
import './styles.css';
import { createMuiTheme } from '@material-ui/core/styles';

const chimeraTheme = createMuiTheme({
	typography: {
		useNextVariants: true
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
