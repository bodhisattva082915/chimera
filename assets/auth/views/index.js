import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import HexPattern from 'chimera-ui/global/components/HexPattern';
import Routes from './routes';

const styles = theme => ({
	bottomCorner: {
		bottom: 0,
		left: 0
	},
	topCorner: {
		top: 0,
		right: 0
	},
	hexPattern: {
		position: 'fixed',
		height: '60vh',
		width: '60vw',
		zIndex: -10
	},
	overlay: {
		position: 'absolute',
		right: 0,
		bottom: 0,
		left: 0,
		top: 0,
		height: '100%',
		width: '100%'
	},
	bottomGradient: {
		background: `linear-gradient(to top right,  rgba(255,255,255,0), rgba(255,255,255,1) 60%)`
	},
	topGradient: {
		background: `linear-gradient(to bottom left,  rgba(255,255,255,0), rgba(255,255,255,1) 60%)`
	}
});

class AppContainer extends React.Component {
	render () {
		const { classes } = this.props;

		function HexGradient (props) {
			const { direction } = props; /* eslint-disable-line react/prop-types */
			return (
				<div className={`${classes.hexPattern} ${classes[direction + 'Corner']}`}>
					<HexPattern />
					<div className={`${classes.overlay} ${classes[direction + 'Gradient']}`}></div>
				</div>
			);
		}

		return (
			<React.Fragment>
				<Routes />
				<HexGradient direction={'top'} />
				<HexGradient direction={'bottom'} />
			</React.Fragment>

		);
	}
}

export default withStyles(styles)(AppContainer);
