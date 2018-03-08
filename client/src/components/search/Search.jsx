import React, { Component } from 'react';
import { connect } from 'react-redux';
import './Search.css';

import TextField from 'material-ui/TextField';

class Search extends Component {
	render() {
		return <TextField 
			id="drawn-count"
			value={this.props.text}
			floatingLabelText="Szukaj"
			onChange={event => this.props.setSearchText(event.target.value)}
		/>;
	}
}

let mapStateToProps = (state, props) => {
	return {
		text: state.appState.searchText || ''
	};
};

let mapDispatchToProps = (dispatch) => {
	return {
		setSearchText: text => {
			dispatch({type: 'setSearchText', text}); 
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Search);