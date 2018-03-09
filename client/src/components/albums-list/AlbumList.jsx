import React, { Component } from 'react';
import { connect } from 'react-redux';
import { map, filter, slice, findIndex, forEach, orderBy } from 'lodash';
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
import NavigationArrowDownward from 'material-ui/svg-icons/navigation/arrow-downward';
import NavigationArrowUpward from 'material-ui/svg-icons/navigation/arrow-upward';
import Badge from 'material-ui/Badge';
import {blue500, red500} from 'material-ui/styles/colors';

const badgeStyle = {
	WebkitTouchCallout: 'none', /* iOS Safari */
	WebkitUserSelect: 'none', /* Safari */
	KhtmlUserSelect: 'none', /* Konqueror HTML */
	MozUserSelect: 'none', /* Firefox */
	msUserSelect: 'none', /* Internet Explorer/Edge */
	userSelect: 'none'
}

class AlbumList extends Component {
	headers = [
		{name: 'band', text: 'Zespół', order: true},
		{name: 'title', text: 'Tytuł albumu', order: true},
		{name: 'year', text: 'Rok premiery', order: true},
		{name: 'format', text: 'Format wydania', order: true},
		{name: 'pubYear', text: 'Rok wydawnictwa', order: true},
		{name: 'publisher', text: 'Wydawca', order: true},
		{name: 'desc', text: 'Opis', order: false},
	]

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
			<TableRowColumn 
				style={{
					whiteSpace: "normal",
					wordWrap: "break-word"
				}}
             >
             	{item.desc}
             </TableRowColumn>
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
					height={`${this.state.height-335}px`} 
					fixedHeader={true}
					fixedFooter={true}
				>
					<TableHeader>
						<TableRow>
							<TableHeaderColumn>No.</TableHeaderColumn>
							{this._renderHeaderContent()}
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
		const { items, perPage, page, drawnItems } = this.props.list;
		const { searchText } = this.props;
		let toShow = {};

		if (!this.props.list.draw) {
			toShow = items;
		} else {
			toShow = drawnItems;
		}

		if (searchText) {
			toShow = filter(
				toShow, 
				item => 
					(item.band.toLowerCase().search(searchText.toLowerCase()) > -1) ||
					(item.title.toLowerCase().search(searchText.toLowerCase()) > -1) ||
					(item.year.toLowerCase().search(searchText.toLowerCase()) > -1) ||
					(item.pubYear.toLowerCase().search(searchText.toLowerCase()) > -1) ||
					(item.publisher.toLowerCase().search(searchText.toLowerCase()) > -1)
			)
		}

		toShow = this._orderBy(toShow);

		const length = toShow.length;
		const start = 0 + (perPage * (page - 1));
		const end = perPage + (perPage * (page - 1));

		if (length > perPage) {
			toShow = slice(toShow, start, end);
		}

		return {items: toShow, pagesCount: Math.ceil(length / perPage)};
	}

	_orderBy(list) {
		const { order } = this.props.list;
		const names = [];
		const orders = [];

		forEach(order, o => {
			names.push(o.name);
			orders.push(o.order)
		});

		list = orderBy(
			list,
			names,
			orders
		);

		return list;
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
		this.setState({page: 1});
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

	_renderHeaderContent() {
		return map(this.headers, header => {
			const data = this._getOrderData(header.name);

			if (!data || !data.Image || !data.number) {
				return (
					<TableHeaderColumn key={header.name}>
						<div 
							onClick={() => header.order ? this.props.switchOrder(header.name) : null} 
							className="header"
							style={header.order ? {cursor: 'pointer'} : {}}
						>
							<div className="headerText">
								<span className="noselect">{header.text}</span>
							</div>
							<div className="headerIcon"></div>
						</div>
					</TableHeaderColumn>
				);
			}

			const { Image, number } = data;

			return (
				<TableHeaderColumn key={header.name}>
					<div 
						onClick={() => this.props.switchOrder(header.name)} 
						className="header"
						style={{cursor: 'pointer'}}
					>
						<div className="headerText">
							<Badge
								badgeContent={number}
								primary={true}
								className="badge"
								badgeStyle={badgeStyle}
							>
								<span className="noselect">{header.text}</span>
							</Badge>
						</div>
						<div className="headerIcon">{Image}</div>
					</div>
				</TableHeaderColumn>
			);
		});
	}

	_getOrderData(categoryName) {
		const { order } = this.props.list;
		const categoryIndex = findIndex(order, item => item.name === categoryName);

		if (!order || !categoryName || categoryIndex === -1) {
			return null;
		}

		const category = order[categoryIndex];
		const viewBox = '0 0 32 32';

		if (category.order === 'desc') {
			return {
				Image: <NavigationArrowDownward color={blue500} viewBox={viewBox} />,
				number: categoryIndex+1
			}
		}

		if (category.order === 'asc') {
			return {
				Image: <NavigationArrowUpward color={blue500} viewBox={viewBox} />,
				number: categoryIndex+1
			}
		}

		return null;
	}

	_remove(id) {
		this.props.setServerWait(true);

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
				this.props.setServerWait(false);
			})
			.catch(error => {
				this.props.setServerWait(false);
			});
	}
}

const mapStateToProps = (state, props) => {
	return {
		list: state.list,
		searchText: state.appState.searchText
	};
};

const mapDispatchToProps = (dispatch) => {
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
		},
		switchOrder: category => {
			dispatch({type: 'switchOrder', category}); 		
		},
		setServerWait: status => {
			dispatch({type: 'setServerWait', status});			
		}
	};
};

export default connect(mapStateToProps, mapDispatchToProps)(AlbumList);
