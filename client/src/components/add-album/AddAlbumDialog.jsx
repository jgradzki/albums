import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map, reduce, find } from 'lodash';
import './AddAlbumDialog.css';
import FlatButton from 'material-ui/FlatButton';
import TextField from 'material-ui/TextField';
import AutoComplete from 'material-ui/AutoComplete';
import Dialog from 'material-ui/Dialog';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Wait from '../wait';
import { formats } from '../../constants';

class AddAlbumDialog extends Component {
	state = {
		form: {
			band: '',
			title: '',
			year: '',
			format: 'CD',
			pubYear: '',
			publisher: '',
			desc: ''
		},
		wait: false
	}

	render() {
		 const actions = [
			<FlatButton
				label="Anuluj"
				primary={true}
				onClick={() => this._handleClose(false)}
			/>,
			<FlatButton
				label="Dodaj"
				primary={true}
				keyboardFocused={true}
				onClick={() => this._handleClose(true)}
			/>,
		];

		return (
			<Dialog
				title="Dodaj Album"
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
			this.props.hideAddDialog();
			return;
		}

		this._wait(true);

		fetch("/api/item", {
			method: 'POST',
			body: JSON.stringify(this.state.form), 
			headers: new Headers({
				'Content-Type': 'application/json'
			})
		})
			.then(response => response.json())
			.then(results => {
				if (results.success && results.id) {
					this.props.addItem({...this.state.form, id: results.id});
				}
				this._wait(false);
				this.props.hideAddDialog();
			})
			.catch(error => {
				this._wait(false);
				this.props.hideAddDialog();
			})
	};

	_renderForm() {
		return (<div className="form">
			<Wait show={this.state.wait} />
			<div className="form-row">
				<AutoComplete
					floatingLabelText="Zespół"
					onUpdateInput={value => this.setState({
						form: { 
							...this.state.form,
							band: value
						} 
					})}
					filter={AutoComplete.caseInsensitiveFilter}
					dataSource={this._getDataSource('band')}
					maxSearchResults={5}
				/>
				<AutoComplete
					floatingLabelText="Tytuł albumu"
					onUpdateInput={value => this.setState({
						form: { 
							...this.state.form,
							title: value
						} 
					})}
					filter={AutoComplete.caseInsensitiveFilter}
					dataSource={this._getDataSource('title')}
					maxSearchResults={5}
				/>
			</div>
			<div className="form-row">
				<TextField
					floatingLabelText="Rok premiery"
					onChange={event => this.setState({
						form: { 
							...this.state.form,
							year: event.target.value
						} 
					})}
				/>
				<SelectField
					floatingLabelText="Format wydania"
					value={this.state.form.format}
					onChange={(event, index, value) => this.setState({
						form: { 
							...this.state.form,
							format: value
						} 
					})}
				>
					{map(formats, format => <MenuItem key={format} value={format} primaryText={format} />)}
				</SelectField>			
			</div>
			<div className="form-row">
				<TextField
					floatingLabelText="Rok wydawnictwa"
					onChange={event => this.setState({
						form: { 
							...this.state.form,
							pubYear: event.target.value
						} 
					})}
				/>
				<AutoComplete
					floatingLabelText="Wydawca"
					onUpdateInput={value => this.setState({
						form: { 
							...this.state.form,
							publisher: value
						} 
					})}
					filter={AutoComplete.caseInsensitiveFilter}
					dataSource={this._getDataSource('publisher')}
					maxSearchResults={5}
				/>
			</div>
			<TextField
				floatingLabelText="Opis"
				fullWidth={true}
				onChange={event => this.setState({
					form: { 
						...this.state.form,
						desc: event.target.value
					} 
				})}
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

	_wait(show = false) {
		this.setState({wait: show});
	}
}

const mapStateToProps = (state, props) => {
	return {
		show: state.appState.showAddDialog || false,
		items: state.list.items || {}
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		hideAddDialog: () => {
			dispatch({type: 'hideAddDialog'}); 
		},
		addItem: item => {
			dispatch({type: 'addItem', item});
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(AddAlbumDialog);