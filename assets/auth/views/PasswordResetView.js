import React from 'react';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { PasswordResetForm } from '../components';

const styles = theme => ({
	root: {
		height: '100%'
	}
});

class PasswordResetView extends React.Component {
	render () {
		const { classes } = this.props;
		return (
			<Grid
				container
				className={classes.root}
				justify={'center'}
				alignContent={'center'}
				children={
					<PasswordResetForm resetPassword={() => console.log('reset password')} />
				}
			/>
		);
	}
}

export default withStyles(styles)(PasswordResetView);
