import React from 'react';
import { Link } from '@material-ui/core';

const ChimeraLink = props => (
	<Link
		component={'button'}
		type='button'
		underline={'none'}
		color={'secondary'}
		variant="body2"
		{...props}
	/>
);

export default ChimeraLink;
