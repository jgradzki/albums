import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map, reduce, find } from 'lodash';
import './EditAlbumDialog.css';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';
import Dialog from 'material-ui/Dialog';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import { formats } from '../../constants';

class EditAlbumDialog extends Component {
	state = {
		band: '',
		title: '',
		year: '',
		format: 'CD',
		pubYear: '',
		publisher: '',
		desc: ''
	}
	
	componentDidUpdate(prevProps, prevState) {
		if (!prevProps.show && this.props.show) {
			this.setState({
				band: this.props.item.band || '',
				title: this.props.item.title || '',
				year: this.props.item.year || '',
				format: this.props.item.format || '',
				pubYear: this.props.item.pubYear || '',
				publisher: this.props.item.publisher || '',
				desc: this.props.item.desc || ''
			});
		}
	}

	render() {
		 const actions = [
			<FlatButton
				label="Anuluj"
				primary={true}
				onClick={() => this._handleClose(false)}
			/>,
			<FlatButton
				label="Zmień"
				primary={true}
				keyboardFocused={true}
				onClick={() => this._handleClose(true)}
			/>,
		];

		if (!this.props.item || !this.props.editId) {
			return null;
		}

		return (
			<Dialog
				title="Edytuj Album"
				actions={actions}
				modal={false}
				open={this.props.show}
				onRequestClose={this._handleClose}
				autoScrollBodyContent={true}
			>
				{this._renderForm()}
			</Dialog>
		);
	}

	_handleClose = param => {
		if (!param) {
			this.props.hideEditDialog();
			return;
		}

		fetch("/api/item", {
			method: 'PUT',
			body: JSON.stringify({
				id: this.props.editId, 
				item: this.state
			}), 
			headers: new Headers({
				'Content-Type': 'application/json'
			})
		})
			.then(response => response.json())
			.then(results => {
				if (results.success && results.id) {
					this.props.editItem(this.props.editId, this.state);
				}

				this.props.hideEditDialog();
			})
			.catch(error => {
				this.props.hideEditDialog();
			})
	};

	_renderForm() {
		return (<div className="form">
			<div className="form-row">
				<AutoComplete
					floatingLabelText="Zespół"
					onUpdateInput={value => this.setState({band: value})}
					filter={AutoComplete.caseInsensitiveFilter}
					dataSource={this._getDataSource('band')}
					maxSearchResults={5}
					searchText={this.state.band}
				/>
				<AutoComplete
					floatingLabelText="Tytuł albumu"
					onUpdateInput={value => this.setState({title: value})}
					filter={AutoComplete.caseInsensitiveFilter}
					dataSource={this._getDataSource('title')}
					maxSearchResults={5}
					searchText={this.state.title}
				/>
			</div>
			<div className="form-row">
				<TextField
					floatingLabelText="Rok premiery"
					onChange={event => this.setState({year: event.target.value})}
					defaultValue={this.state.year}
				/>
				<SelectField
					floatingLabelText="Format wydania"
					value={this.state.format}
					onChange={(event, index, value) => this.setState({format: value})}
				>
					{map(formats, format => <MenuItem key={format} value={format} primaryText={format} />)}
				</SelectField>			
			</div>
			<div className="form-row">
				<TextField
					floatingLabelText="Rok wydawnictwa"
					onChange={event => this.setState({pubYear: event.target.value})}
					defaultValue={this.state.pubYear}
				/>
				<AutoComplete
					floatingLabelText="Wydawca"
					onUpdateInput={value => this.setState({publisher: value})}
					filter={AutoComplete.caseInsensitiveFilter}
					dataSource={this._getDataSource('publisher')}
					maxSearchResults={5}
					searchText={this.state.publisher}
				/>
			</div>
			<TextField
				floatingLabelText="Opis"
				fullWidth={true}
				onChange={event => this.setState({desc: event.target.value})}
				defaultValue={this.state.desc}
			/>
		</div>);
	}

	_getDataSource(key) {
		return reduce(this.props.items, function(all, item) {
			if (find(all, i => i === item[key])) {
				return all;
			}

			all.push(item[key]);
			return all;
		}, [])
	}
}

let mapStateToProps = (state, props) => {
	return {
		show: state.appState.showEditDialog || false,
		item: state.list.items[state.appState.editId] || null,
		editId: state.appState.editId || null,
		items: state.list.items || {}
	};
};

let mapDispatchToProps = (dispatch) => {
	return {
		hideEditDialog: () => {
			dispatch({type: 'hideEditDialog'}); 
		},
		editItem: (id, item) => {
			dispatch({type: 'editItem', id, item});
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(EditAlbumDialog);