import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

class LoginForm extends React.Component {
	render () {
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
					onClick={ev => ev.preventDefault()}
				>
                    Login
				</Button>
			</form>
		);
	}
}

export default LoginForm;
