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
import Checkbox from 'material-ui/Checkbox';
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
			desc: '',
			limited: false,
			limitedCount: 0,
			numbered: false,
			numberedCount: 0,
			firstEdition: false,
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
					this._resetState();
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
					searchText={this.state.form.band}
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
					searchText={this.state.form.title}
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
					value={this.state.form.year}
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
					value={this.state.form.pubYear}
					onChange={event => this.setState({
						form: {
							...this.state.form,
							pubYear: event.target.value
						}
					})}
				/>
				<AutoComplete
					floatingLabelText="Wydawca"
					searchText={this.state.form.publisher}
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

			<div className="form-row checkbox_container">
				<Checkbox
					label="Limitowane"
					checked={this.state.form.limited}
					onClick={() => this.setState({
						form: {
							...this.state.form,
							limited: !this.state.form.limited,
						}
					})}
				/>

					{
						this.state.form.limited && (
							<TextField
								floatingLabelText="Ilość"
								type="number"
								value={this.state.form.limitedCount}
								onFocus={() => !this.state.form.limitedCount && this.setState({
									form: {
										...this.state.form,
										limitedCount: '',
									}
								})}
								onChange={event => this.setState({
									form: {
										...this.state.form,
										limitedCount: Number(event.target.value),
									}
								})}
							/>
						)
					}

			</div>

			<div className="form-row checkbox_container">
				<Checkbox
					label="Numerowane"
					checked={this.state.form.numbered}
					onClick={() => this.setState({
						form: {
							...this.state.form,
							numbered: !this.state.form.numbered,
						}
					})}
				/>

				{
					this.state.form.numbered && (
						<TextField
							floatingLabelText="Numer"
							type="number"
							value={this.state.form.numberedCount}
							onFocus={() => !this.state.form.numberedCount && this.setState({
								form: {
									...this.state.form,
									numberedCount: '',
								}
							})}
							onChange={event => this.setState({
								form: {
									...this.state.form,
									numberedCount: Number(event.target.value),
								}
							})}
						/>
					)
				}
			</div>

			<div className="form-row checkbox_container">
				<Checkbox
					label="Pierwsze wydanie"
					checked={this.state.form.firstEdition}
					onClick={() => this.setState({
						form: {
							...this.state.form,
							firstEdition: !this.state.form.firstEdition,
						}
					})}
				/>
			</div>

			<TextField
				floatingLabelText="Opis"
				fullWidth={true}
				value={this.state.form.desc}
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

	_resetState() {
		this.setState({
			form: {
				band: '',
				title: '',
				year: '',
				format: 'CD',
				pubYear: '',
				publisher: '',
				desc: '',
				limited: false,
				limitedCount: 0,
				numbered: false,
				numberedCount: 0,
				firstEdition: false,
			},
			wait: false,
		})
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
