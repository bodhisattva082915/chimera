import React from 'react';
import PropTypes from 'prop-types';
import { Typography, TextField, InputAdornment, IconButton } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { SubmitButton } from 'chimera-ui/global/components';

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
		const { resetPassword } = this.props;

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
			<form onSubmit={ev => ev.preventDefault() && resetPassword(ev)}>
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
				<SubmitButton
					variant='contained'
					fullWidth={true}
					children={'Reset Password'}
				/>
			</form>
		);
	}
}

export default PasswordResetForm;
