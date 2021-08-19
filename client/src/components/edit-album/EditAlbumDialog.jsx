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
import Wait from '../wait';
import { formats } from '../../constants';
import Checkbox from "material-ui/Checkbox";

class EditAlbumDialog extends Component {
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

	componentDidUpdate(prevProps, prevState) {
		if (!prevProps.show && this.props.show) {
			this.setState({
				...this.state,
				form: {
					band: this.props.item.band || '',
					title: this.props.item.title || '',
					year: this.props.item.year || '',
					format: this.props.item.format || '',
					pubYear: this.props.item.pubYear || '',
					publisher: this.props.item.publisher || '',
					desc: this.props.item.desc || '',
					limited: this.props.item.limited || '',
					limitedCount: this.props.item.limitedCount || '',
					numbered: this.props.item.numbered || '',
					numberedCount: this.props.item.numberedCount || '',
					firstEdition: this.props.item.firstEdition || '',
				}
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

		this._wait(true);

		fetch("/api/item", {
			method: 'PUT',
			body: JSON.stringify({
				id: this.props.editId,
				item: this.state.form
			}),
			headers: new Headers({
				'Content-Type': 'application/json'
			})
		})
			.then(response => response.json())
			.then(results => {
				if (results.success && results.id) {
					this.props.editItem({...this.state.form, id: results.id});
				}

				this._wait(false);
				this.props.hideEditDialog();
			})
			.catch(error => {
				this._wait(false);
				this.props.hideEditDialog();
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
					searchText={this.state.form.band}
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
					searchText={this.state.form.title}
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
					defaultValue={this.state.form.year}
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
					defaultValue={this.state.form.pubYear}
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
					searchText={this.state.form.publisher}
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
				onChange={event => this.setState({
					form: {
						...this.state.form,
						desc: event.target.value
					}
				})}
				defaultValue={this.state.form.desc}
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
		show: state.appState.showEditDialog || false,
		item: find(state.list.items, album => album.id === state.appState.editId),
		editId: state.appState.editId || null,
		items: state.list.items || {}
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		hideEditDialog: () => {
			dispatch({type: 'hideEditDialog'});
		},
		editItem: (item) => {
			dispatch({type: 'editItem', item});
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(EditAlbumDialog);
