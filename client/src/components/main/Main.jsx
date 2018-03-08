import React, { Component } from 'react';
import { connect } from 'react-redux';
import { random, find } from 'lodash';
import logo from './logo.svg';
import './Main.css';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import AlbumList from '../albums-list';
import AddAlbumDialog from '../add-album';
import EditAlbumDialog from '../edit-album';

class Main extends Component {
	state = {
		drawCount: 1
	}

	render() {
		return (
			<div className="App">
				<header className="App-header">
					<img src={logo} className="App-logo" alt="logo" />
					<h1 className="App-title">Albums</h1>
				</header>
				<div className="App-intro">
					<RaisedButton label="Dodaj album" primary={true} onClick={() => this.props.showAddDialog()} style={{height: 'auto'}} />
					<FlatButton label="Losuj: " onClick={() => this._draw()} /> 
					<TextField id="drawn-count" value={this.state.drawCount} style={{width: '40px'}} onChange={event => this.setState({drawCount: parseInt(event.target.value, 10)})} />
					<FlatButton label="Resetuj" onClick={() => this.props.reset()} /> 
					<AlbumList />
				</div>
				<AddAlbumDialog />
				<EditAlbumDialog />
			</div>		
		);
	}

	_draw() {
		const { items } = this.props;
		const count = (this.state.drawCount > items.length ? items.length : this.state.drawCount);
		const drawn = [];

		while (drawn.length < count) {
			const i = random(0,  items.length - 1);

			if (!find(drawn, drawnItem => drawnItem.id === items[i].id)) {
				drawn.push(items[i]);
			}		
		}

		this.props.setDrawn(drawn);
	}

}

let mapStateToProps = (state, props) => {
	return {
		items: state.list.items || {}
	};
};

let mapDispatchToProps = (dispatch) => {
	return {
		showAddDialog: () => {
			dispatch({type: 'showAddDialog'}); 
		},
		setDrawn: drawn => {
			dispatch({type: 'setDrawn', drawn})
		},
		reset: drawn => {
			dispatch({type: 'reset'})
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(Main);