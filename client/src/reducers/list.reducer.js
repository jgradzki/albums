import { pickBy } from 'lodash';

const listReducer = (state = {}, action) => {
	switch (action.type) {
		case 'setLoaded':
			return {
				...state,
				loaded: true,
				items: action.items
			}
		case 'addItem': 
			return {
				...state,
				items: {
					...state.items,
					[action.id]: action.item
				}
				
			}
		case 'removeItem': 
			return {
				...state,
				items: pickBy(state.items, (item, key) => key !== action.id)
			}
		case 'editItem':
			return {
				...state,
				items: {
					...state.items,
					[action.id]: action.item
				}
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
