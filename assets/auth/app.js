import React from 'react';
import RootProviders from './providers';
import RootView from './views';

class App extends React.Component {
	render () {
		return (
			<RootProviders>
				<RootView />
			</RootProviders>
		);
	}
}

export default App;
