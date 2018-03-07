import { pickBy } from 'lodash';

const listReducer = (state = {}, action) => {
	switch (action.type) {
		case 'setLoaded':
			return {
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
		default:
			return state;
	}
};


export default listReducer;
