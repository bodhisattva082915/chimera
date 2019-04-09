import React from 'react';
import { Typography, TextField, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ChimeraLink } from 'chimera-ui/global/components';

const styles = theme => ({
	spaced: {
		margin: `${theme.spacing.unit * 1.5}px 0`
	}
});

function ForgotCredentialsForm (props) {
	const { classes } = props;

	return (
		<form>
			<Typography
				children={`
					Enter the email address associated with your account to receive an 
					email containing a ${props.mode === 'p' ? 'password reset link' : 'reminder of your username'}.
				`}
			/>
			<TextField
				type="text"
				label="Email"
				fullWidth={true}
				margin="normal"
				helptext="hey"
			/>
			<Button
				type='submit'
				variant='contained'
				fullWidth={true}
				className={classes.spaced}
				onClick={ev => ev.preventDefault()}
				children={'Send Request'}
			/>
			<ChimeraLink
				children={'Back'}
				onClick={props.back}
			/>
		</form>
	);
}

export default withStyles(styles)(ForgotCredentialsForm);
