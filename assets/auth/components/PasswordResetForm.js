import React from 'react';
import PropTypes from 'prop-types';
import { Typography, TextField } from '@material-ui/core';
import { SubmitButton, PasswordVisibility } from 'chimera-ui/global/components';

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
						endAdornment: <PasswordVisibility
							isVisible={this.state.passwordVisibility}
							toggleVisibility={() => this.setState({ passwordVisibility: !this.state.passwordVisibility })}
						/>
					}}
				/>
				<TextField
					type={!this.state.passwordVisibility ? 'password' : 'text'}
					label="Confirm Password"
					fullWidth={true}
					margin="normal"
					InputProps={{
						endAdornment: <PasswordVisibility
							isVisible={this.state.passwordVisibility}
							toggleVisibility={() => this.setState({ passwordVisibility: !this.state.passwordVisibility })}
						/>
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
