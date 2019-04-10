import React from 'react';
import PropTypes from 'prop-types';
import { InputAdornment, IconButton } from '@material-ui/core';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';

class PasswordVisibility extends React.PureComponent {

	static propTypes = {
		isVisible: PropTypes.bool,
		toggleVisibility: PropTypes.func
	}

	render () {
		const { isVisible, toggleVisibility } = this.props;
		return <InputAdornment
			position={'end'}
			children={
				<IconButton
					aria-label="Toggle password visibility"
					onClick={toggleVisibility}
					children={!isVisible ? <Visibility /> : <VisibilityOff />}
				/>
			}
		/>;
	}
};

export default PasswordVisibility;
