import React from 'react';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { LoginForm } from '../components';

const styles = theme => ({
	root: {
		height: '100%'
	},
	logo: {
		textAlign: 'center'
	},
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
			<Grid
				container
				className={classes.root}
				justify={'space-evenly'}
				alignItems={'center'}
				alignContent={'center'}
				children={[
					<Grid
						item xs={4}
						key="loginForm"
						children={<LoginForm />}
					/>,
					<Grid
						item xs={4}
						key="logo"
						component={'img'}
						alt={'chimera_logo.png'}
						className={classes.logo}
					/>,
					<div key="corner" className={classes.corner}></div>
				]}
			/>
		);
	}
}

export default withStyles(styles)(AppContainer);
