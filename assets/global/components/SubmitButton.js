import React from 'react';
import { Button } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	spaced: {
		margin: `${theme.spacing.unit * 1.5}px 0`
	}
});

class SubmitButton extends React.PureComponent {

	render () {
		const { classes, ...otherProps } = this.props;

		return (
			<Button
				type="submit"
				className={classes.spaced}
				{...otherProps}
			/>
		);
	}

}

export default withStyles(styles)(SubmitButton);
