import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Routes from './routes';

const styles = theme => ({
	corner: {
		position: 'fixed',
		width: '70vw',
		height: '25vw',
		bottom: '-15vw',
		left: '-15vw',
		background: `${theme.palette.primary.main}`,
		transform: 'rotate(25deg)',
		'-webkit-box-shadow': '0px -5px 10px 1px rgba(117,117,117,0.75)',
		'-moz-box-shadow': '0px -5px 10px 1px rgba(117,117,117,0.75)',
		'box-shadow': '0px -5px 10px 1px rgba(117,117,117,0.75)'
	}
});

class AppContainer extends React.Component {
	render () {
		const { classes } = this.props;
		return (
			<React.Fragment>
				<Routes />
				<div key="corner" className={classes.corner}></div>
			</React.Fragment>
		);
	}
}

export default withStyles(styles)(AppContainer);
