import React from 'react';
import PropTypes from 'prop-types';
import { Typography, TextField, InputAdornment, IconButton, Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

const styles = theme => ({
	spaced: {
		margin: `${theme.spacing.unit * 1.5}px 0`
	}
});

class PasswordResetForm extends React.Component {

	static propTypes = {
		resetPassword: PropTypes.func.isRequired
	};

	constructor (props) {
		super(props);

		this.state = {
			passwordVisibility: false
		};
	}

	render () {
		const { classes, resetPassword } = this.props;

		const PasswordVisibility = () => {
			return <InputAdornment
				position={'end'}
				children={
					<IconButton
						aria-label="Toggle password visibility"
						onClick={() => this.setState({ passwordVisibility: !this.state.passwordVisibility })}
						children={!this.state.passwordVisibility ? <Visibility /> : <VisibilityOff />}
					/>
				}
			/>;
		};

		return (
			<form>
				<Typography
					variant="h2"
					children={'Password Reset'}
				/>
				<TextField
					type={!this.state.passwordVisibility ? 'password' : 'text'}
					label="New Password"
					fullWidth={true}
					margin="normal"
					InputProps={{
						endAdornment: <PasswordVisibility />
					}}
				/>
				<TextField
					type={!this.state.passwordVisibility ? 'password' : 'text'}
					label="Confirm Password"
					fullWidth={true}
					margin="normal"
					InputProps={{
						endAdornment: <PasswordVisibility />
					}}
				/>
				<Button
					type='submit'
					variant='contained'
					fullWidth={true}
					className={classes.spaced}
					onClick={resetPassword}
					children={'Reset Password'}
				/>
			</form>
		);
	}
}

export default withStyles(styles)(PasswordResetForm);
