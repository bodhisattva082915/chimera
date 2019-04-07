import React from 'react';
import RootProviders from './providers';
import LoginForm from './components/LoginForm';

class App extends React.Component {
	render () {
		return (
			<RootProviders>
				<LoginForm />
			</RootProviders>
		);
	}
}

export default App;
