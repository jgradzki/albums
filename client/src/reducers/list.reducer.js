import { filter, slice, map } from 'lodash';

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
				drawnItems: action.drawn
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
		default:
			return state;
	}
};


export default listReducer;
