import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map } from 'lodash';
import './AlbumList.css';
import {
	Table,
	TableBody,
	TableHeader,
	TableHeaderColumn,
	TableRow,
	TableRowColumn,
	TableFooter
} from 'material-ui/Table';
import CircularProgress from 'material-ui/CircularProgress';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ImageEdit from 'material-ui/svg-icons/image/edit';
import {blue500, red500} from 'material-ui/styles/colors';

class AlbumList extends Component {
	state = {
		height: window.innerHeight,
		error: false
	}

	componentDidMount() {
		window.addEventListener("resize", () => this.updateDimensions());

		fetch("/api/list")
			.then(response => response.json())
			.then(results => {
				if (results.success) {
					this.props.setLoaded(results.data || {});
				}
			})
			.catch(error => {
				this.setState({error: true})
			});
	}

	updateDimensions() {
		this.setState({
			height: window.innerHeight
		});
	}

	render() {
		if (this.state.error) {
			return <div className="AlbumList">Server error</div>
		}

		if (this.props.list.loaded) {
			return this._renderList()
		} else {
			return (<div className="AlbumList">
				<div className="loading">
					<CircularProgress size={90} thickness={5} />
				</div>
			</div>);
		}
	}

	_renderItem(item, id, number) {
		return (<TableRow key={number}>
			<TableRowColumn>{number}</TableRowColumn>
			<TableRowColumn>{item.band}</TableRowColumn>
			<TableRowColumn>{item.title}</TableRowColumn>
			<TableRowColumn>{item.year}</TableRowColumn>
			<TableRowColumn>{item.format}</TableRowColumn>
			<TableRowColumn>{item.pubYear}</TableRowColumn>
			<TableRowColumn>{item.publisher}</TableRowColumn>
			<TableRowColumn>{item.desc}</TableRowColumn>
			<TableRowColumn>
				<IconButton>
					<ImageEdit color={blue500} onClick={() => this.props.editItem(id)} />
				</IconButton>
				<IconButton>
					<ActionDelete color={red500} onClick={() => this._remove(id)} />
				</IconButton>
			</TableRowColumn>
		</TableRow>);
	}

	_renderList() {
		let number = 0;

		return (
			<div className="AlbumList">
				<Table 
					selectable={false} 
					height={`${this.state.height-327}px`} 
					fixedHeader={true}
					fixedFooter={true}
				>
					<TableHeader>
						<TableRow>
							<TableHeaderColumn>No.</TableHeaderColumn>
							<TableHeaderColumn>Zespół</TableHeaderColumn>
							<TableHeaderColumn>Tytuł albumu</TableHeaderColumn>
							<TableHeaderColumn>Rok premiery</TableHeaderColumn>
							<TableHeaderColumn>Format wydania</TableHeaderColumn>
							<TableHeaderColumn>Rok wydawnictwa</TableHeaderColumn>
							<TableHeaderColumn>Wydawca</TableHeaderColumn>
							<TableHeaderColumn>Opis</TableHeaderColumn>
							<TableHeaderColumn>Akcja</TableHeaderColumn>
						</TableRow>
					</TableHeader>
					<TableBody>
						{map(this.props.list.items, (item, id) => {
							number++;
							return this._renderItem(item, id, number);
						})}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableRowColumn colSpan="3" style={{textAlign: 'center'}}>
							Super Footer
							</TableRowColumn>
						</TableRow>
					</TableFooter>
				</Table>
			</div>
		);
	}

	_remove(id) {
		fetch("/api/item", {
			method: 'DELETE',
			body: JSON.stringify({id}), 
			headers: new Headers({
				'Content-Type': 'application/json'
			})
		})
			.then(response => response.json())
			.then(results => {
				if (results.success) {
					this.props.removeItem(id);
				}
			});
	}
}

let mapStateToProps = (state, props) => {
	return {
		list: state.list
	};
};

let mapDispatchToProps = (dispatch) => {
	return {
		setLoaded: items => {
			dispatch({type: 'setLoaded', items}); 
		},
		removeItem: id => {
			dispatch({type: 'removeItem', id}); 
		},
		editItem: id => {
			dispatch({type: 'showEditDialog', id}); 
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(AlbumList);
