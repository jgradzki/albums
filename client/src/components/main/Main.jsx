import React, { Component } from 'react';
import { connect } from 'react-redux';
import logo from './logo.svg';
import './Main.css';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import AlbumList from '../albums-list';
import AddAlbumDialog from '../add-album';
import EditAlbumDialog from '../edit-album';

class Main extends Component {
	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Albums</h1>
				</header>
				<div className="App-intro">
					<RaisedButton label="Dodaj album" primary={true} onClick={() => this.props.showAddDialog()} style={{height: 'auto'}} />
					<FlatButton label="Losuj: " /> 
					<TextField defaultValue={1} style={{width: '40px'}} name="rand_count" />
					<FlatButton label="Resetuj" /> 
					<AlbumList />
				</div>
				<AddAlbumDialog />
				<EditAlbumDialog />
			</div>		
		);
	}
}

let mapStateToProps = (state, props) => {
	return {};
};

let mapDispatchToProps = (dispatch) => {
	return {
		showAddDialog: () => {
			dispatch({type: 'showAddDialog'}); 
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);