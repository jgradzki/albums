import { combineReducers } from 'redux';
import appReducer from './app.reducer';
import listReducer from './list.reducer';

const reducers = combineReducers({
	appState: appReducer,
	list: listReducer
});

export default reducers;
