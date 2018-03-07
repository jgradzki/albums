const appReducer = (state = {}, action) => {
	switch (action.type) {
		case 'showAddDialog': 
			return {
				...state,
				showEditDialog: false,
				showAddDialog: true,
				editId: null			
			}
		case 'hideAddDialog': 
			return {
				...state,
				showAddDialog: false
			}
		case 'showEditDialog': 
			return {
				...state,
				showAddDialog: false,
				showEditDialog: true,
				editId: action.id
			}
		case 'hideEditDialog': 
			return {
				...state,
				showEditDialog: false,
				editId: null
			}
		default:
			return state;
	}
};


export default appReducer;
