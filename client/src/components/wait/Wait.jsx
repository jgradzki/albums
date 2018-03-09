import React, { Component } from 'react';
import './Wait.css';
import Dialog from 'material-ui/Dialog';
import CircularProgress from 'material-ui/CircularProgress';

class Wait extends Component {
	render() {
		return <Dialog
				title="Przetwarzanie"
				modal={true}
				open={this.props.show || false}
				autoScrollBodyContent={true}
				contentStyle={{width: "200px", height: '200px', maxWidth: "none"}}
				paperClassName=""
			>
				<CircularProgress size={50} thickness={5} className="waitDialog" />
			</Dialog>;
	}
}

export default Wait;