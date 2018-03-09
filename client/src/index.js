import React from 'react';
import ReactDOM from 'react-dom';
import { createStore } from 'redux';
import { Provider } from 'react-redux';
import './index.css';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Main from './components/main';
import reducers from './reducers';
import registerServiceWorker from './registerServiceWorker';

const store = createStore(reducers, 
	{
		appState: {},
		list: {
			loaded: false,
			items: {},
			perPage: 25,
			page: 1,
			order: []
		}
	},
	process.env.NODE_ENV !== 'production' ? window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__() : undefined
)

const App = () => (
	<MuiThemeProvider>
		<Main />
	</MuiThemeProvider>
);

ReactDOM.render(<Provider store = { store }><App /></Provider>, document.getElementById('root'));
registerServiceWorker();
