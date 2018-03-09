import { filter, slice, map, findIndex } from 'lodash';

const listReducer = (state = {}, action) => {
	switch (action.type) {
		case 'setLoaded':
			return {
				...state,
				loaded: true,
				items: action.items
			}
		case 'addItem': 
			const items = slice(state.items);
			items.push(action.item);

			return {
				...state,
				items
			}
		case 'removeItem': 
			return {
				...state,
				items: filter(state.items, (item, key) => item.id !== action.id),
				drawnItems: filter(state.drawnItems, (item, key) => item.id !== action.id)
			}
		case 'editItem':
			return {
				...state,
				items: map(state.items, item => {
					if (item.id === action.item.id) {
						return action.item;
					}

					return item;
				})
			}
		case 'setDrawn': 
			return {
				...state,
				draw: true,
				drawnItems: action.drawn,
				page: 1
			}
		case 'reset': 
			return {
				...state,
				draw: false,
				drawnItems: []
			}
		case 'setPerPage':
			return {
				...state,
				perPage: action.count
			}
		case 'setPage':
			return {
				...state,
				page: action.page
			}
		case 'switchOrder':
			return switchOrder(state, action);
		default:
			return state;
	}
};

const switchOrder = (state, action) => {
	if (!action.category) {
		return state;
	}

	const order = slice(state.order);
	const categoryIndex = findIndex(order, o => o.name === action.category);
	const category = order[categoryIndex];

	if (!category) {
		order.push({name: action.category, order: 'desc'})
	} else if (category.order === 'desc') {
		category.order = 'asc';
	} else if (category.order === 'asc') {
		order.splice(categoryIndex, 1);
	}

	return {
		...state,
		order
	};
}


export default listReducer;
