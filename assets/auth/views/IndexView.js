import React from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Grid } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { LoginForm, ForgotCredentialsForm } from '../components';
import ChimeraLogo from 'chimera-ui/images/logo.png';

const styles = theme => ({
	root: {
		height: '100%'
	},
	logo: {
		textAlign: 'center'
	}
});

class IndexView extends React.Component {
	constructor (props) {
		super(props);

		this.state = {
			view: 0,
			mode: ''
		};
	}

	render () {
		const { classes } = this.props;
		return (
			<Grid
				container
				className={classes.root}
				justify={'center'}
				alignItems={'center'}
				alignContent={'center'}
				direction={'row'}
				children={
					<React.Fragment>
						<Grid
							item xs={12}
							className={classes.logo}
							children={
								<img
									alt={'chimera_logo.png'}
									src={ChimeraLogo}
								/>
							}
						/>
						<Grid
							item md={4} xs={8}
							children={(
								<SwipeableViews disabled index={this.state.view}>
									<LoginForm
										forgotUsername={() => this.setState({ view: 1, mode: 'u' })}
										forgotPassword={() => this.setState({ view: 1, mode: 'p' })}
									/>
									<ForgotCredentialsForm
										mode={this.state.mode}
										back={() => this.setState({ view: 0, mode: '' })}
									/>
								</SwipeableViews>
							)}
						/>
					</React.Fragment>
				}
			/>
		);
	}
}

export default withStyles(styles)(IndexView);
