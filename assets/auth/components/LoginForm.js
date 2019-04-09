import React from 'react';
import { TextField, Button, Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ChimeraLink } from 'chimera-ui/global/components';

const styles = theme => ({
	spaced: {
		margin: `${theme.spacing.unit * 1.5}px 0`
	}
});

class LoginForm extends React.Component {

	render () {
		const { classes } = this.props;
		return (
			<form>
				<TextField
					type="text"
					label="Username / Email"
					fullWidth={true}
					margin="normal"
				/>
				<TextField
					type="password"
					label="Password"
					fullWidth={true}
					margin="normal"
				/>
				<Button
					type='submit'
					variant='contained'
					fullWidth={true}
					className={classes.spaced}
					onClick={ev => ev.preventDefault()}
					children={'Login'}
				/>
				<Grid
					container
					justify={'space-between'}
					className={classes.spaced}
					children={[
						<Grid
							item
							key="forgotUsername"
							component={ChimeraLink}
							children={'Forgot Username'}
							onClick={this.props.forgotUsername}
						/>,
						<Grid
							item
							key="forgotPassword"
							component={ChimeraLink}
							children={'Forgot Password'}
							onClick={this.props.forgotPassword}
						/>
					]}
				/>
			</form>
		);
	}
}

export default withStyles(styles)(LoginForm);
