import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import HexPattern from 'chimera-ui/global/components/HexPattern';
import Routes from './routes';

const styles = theme => ({
	hexPattern: {
		position: 'fixed',
		height: '50vh',
		width: '50vw',
		bottom: 0,
		left: 0,
		zIndex: -10
	},
	gradient: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		left: 0,
		top: 0,
		height: '100%',
		width: '100%',
		background: `linear-gradient(to top right,  rgba(255,255,255,0), rgba(255,255,255,1) 70%)`
	}
});

class AppContainer extends React.Component {
	render () {
		const { classes } = this.props;
		return (
			<React.Fragment>
				<Routes />
				<div className={classes.hexPattern}>
					<HexPattern />
					<div className={classes.gradient}></div>
				</div>
			</React.Fragment>

		);
	}
}

export default withStyles(styles)(AppContainer);
