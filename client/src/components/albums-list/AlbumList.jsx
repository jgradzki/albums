import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map, find, filter } from 'lodash';
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
import TextField from 'material-ui/TextField';
import CircularProgress from 'material-ui/CircularProgress';
import IconButton from 'material-ui/IconButton';
import ActionDelete from 'material-ui/svg-icons/action/delete';
import ImageEdit from 'material-ui/svg-icons/image/edit';
import NavigationChevronLeft from 'material-ui/svg-icons/navigation/chevron-left';
import NavigationChevronRight from 'material-ui/svg-icons/navigation/chevron-right';
import {blue500, red500} from 'material-ui/styles/colors';

class AlbumList extends Component {
	state = {
		height: window.innerHeight,
		error: false,
		page: this.props.list.page || 0
	}

	componentDidMount() {
		window.addEventListener("resize", () => this.updateDimensions());

		fetch("/api/list")
			.then(response => response.json())
			.then(results => {
				if (results.success) {
					this.props.setLoaded(map(results.data || {}, (item, key) => ({
						...item,
						id: key
					})));
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

	_renderItem(item, number) {
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
					<ImageEdit color={blue500} onClick={() => this.props.editItem(item.id)} />
				</IconButton>
				<IconButton>
					<ActionDelete color={red500} onClick={() => this._remove(item.id)} />
				</IconButton>
			</TableRowColumn>
		</TableRow>);
	}

	_renderList() {
		const { page } = this.props.list;
		const { items, pagesCount } = this._getList();

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
						{map(items, (item, number) => this._renderItem(item, number+1))}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TableRowColumn colSpan="3" className="footer">
								<div className="per-page">
									<div className="text">Na strone:</div>
									<div className="input-field">
										<TextField 
											id="per-page-count"
											style={{width: '30px'}}
											value={this.props.list.perPage || ''}
											onChange={event => this._setPerPageCount(event.target.value)}
										/>
									</div>
								</div>
								<div className="pages">
									<div className="nav">
										<IconButton>
											<NavigationChevronLeft color={blue500} onClick={() => {this._setPage(page - 1)}} />
										</IconButton>
										<IconButton>
											<NavigationChevronRight color={blue500} onClick={() => {this._setPage(page + 1)}} />
										</IconButton>
									</div>
									<div className="text">Strona</div>
									<div className="input-field">
										<TextField 
											id="page-number"
											style={{width: '30px'}}
											value={this.state.page}
											onChange={event => this._onPageInputChange(event.target.value)}
										/>
									</div>
									<div className="text">z {pagesCount}</div>
								</div>
							</TableRowColumn>
						</TableRow>
					</TableFooter>
				</Table>
			</div>
		);
	}

	_getList() {
		const { items, perPage, page } = this.props.list;
		let toShow = {};

		if (!this.props.list.draw) {
			toShow = items;
		} else {
			toShow = filter(items, item => find(this.props.list.drawnItems, drawnItem => drawnItem === item.id));
		}

		const length = toShow.length;
		const start = 0 + (perPage * (page - 1));
		const end = perPage + (perPage * (page - 1)) - 1;

		if (length > perPage) {
			toShow = filter(toShow, (item, index) => (index >= start) && (index <= end));
		}

		return {items: toShow, pagesCount: Math.ceil(length / perPage)};
	}

	_onPageInputChange(page) {
		this.setState({page});
		this._setPage(page);
	}

	_setPerPageCount(count) {
		count = parseInt(count, 10);
		
		if (isNaN(count)) {
			count = null;
		}

		this.props.setPerPage(count);
	}

	_setPage(page) {
		const { pagesCount } = this._getList();
		page = parseInt(page, 10);

		if(isNaN(page)) {
			return;
		}

		if (page < 1) {
			page = 1;
		}
		if (page > pagesCount) {
			page = pagesCount;
		}
		
		this.props.setPage(page);
		this.setState({
			page
		});
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
		},
		setPerPage: count => {
			dispatch({type: 'setPerPage', count}); 		
		},
		setPage: page => {
			dispatch({type: 'setPage', page}); 		
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(AlbumList);
