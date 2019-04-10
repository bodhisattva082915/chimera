import React from 'react';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
	path: {
		fill: theme.palette.background.default,
		stroke: theme.palette.grey[500],
		strokeWidth: 2
	}
});

class HexPattern extends React.PureComponent {
	render () {
		const { classes } = this.props;
		return (
			<svg width="100%" height="100%">

				{/* <!-- Define the pattern --> */}
				<pattern id="pattern-hex" x="0" y="0" width="112" height="190" patternUnits="userSpaceOnUse" viewBox="56 -254 112 190">

					{/* <!-- Group the hexagon shapes -->
                    <!-- Each path could have a class for more styling/animating options -->
                    <!-- We're going to control the fill and stroke in the CSS for flexibility --> */}
					<g id="hexagon">
						<path className={classes.path} d="M168-127.1c0.5,0,1,0.1,1.3,0.3l53.4,30.5c0.7,0.4,1.3,1.4,1.3,2.2v61c0,0.8-0.6,1.8-1.3,2.2L169.3-0.3
                        c-0.7,0.4-1.9,0.4-2.6,0l-53.4-30.5c-0.7-0.4-1.3-1.4-1.3-2.2v-61c0-0.8,0.6-1.8,1.3-2.2l53.4-30.5C167-127,167.5-127.1,168-127.1
                        L168-127.1z"/>
						<path className={classes.path} d="M112-222.5c0.5,0,1,0.1,1.3,0.3l53.4,30.5c0.7,0.4,1.3,1.4,1.3,2.2v61c0,0.8-0.6,1.8-1.3,2.2l-53.4,30.5
                        c-0.7,0.4-1.9,0.4-2.6,0l-53.4-30.5c-0.7-0.4-1.3-1.4-1.3-2.2v-61c0-0.8,0.6-1.8,1.3-2.2l53.4-30.5
                        C111-222.4,111.5-222.5,112-222.5L112-222.5z"/>
						<path className={classes.path} d="M168-317.8c0.5,0,1,0.1,1.3,0.3l53.4,30.5c0.7,0.4,1.3,1.4,1.3,2.2v61c0,0.8-0.6,1.8-1.3,2.2L169.3-191
                        c-0.7,0.4-1.9,0.4-2.6,0l-53.4-30.5c-0.7-0.4-1.3-1.4-1.3-2.2v-61c0-0.8,0.6-1.8,1.3-2.2l53.4-30.5
                        C167-317.7,167.5-317.8,168-317.8L168-317.8z"/>
					</g>

				</pattern>
				{/* <!-- The canvas for our pattern --> */}
				<rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-hex)" />
			</svg>
		);
	}
};

export default withStyles(styles)(HexPattern);
