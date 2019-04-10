import React from 'react';
import PropTypes from 'prop-types';
import { Typography, TextField, InputAdornment, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	spaced: {
		margin: `${theme.spacing.unit * 1.5}px 0`
	}
});

class PasswordResetForm extends React.Component {

	static propTypes = {

	};

	render () {
		const { classes } = this.props;
		return (
			<form>
				<Typography
					component="h2"
					variant="display2"
					children={'Password Reset'}
				/>
				<TextField
					type="password"
					label="New Password"
					fullWidth={true}
					margin="normal"
				/>
				<TextField
					type="password"
					label="Confirm Password"
					fullWidth={true}
					margin="normal"
					// InputProps={{
					// 	endAdornment: <InputAdornment
					// 		position={'end'}
					// 	/>
					// }}
				/>
				<Button
					type='submit'
					variant='contained'
					fullWidth={true}
					className={classes.spaced}
					onClick={ev => ev.preventDefault()}
					children={'Reset Password'}
				/>
			</form>
		);
	}
}

export default withStyles(styles)(PasswordResetForm);
