const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const JsonDB = require('node-json-db');
const uuidv4 = require('uuid/v4');
const _ = require('lodash');

const db = new JsonDB("database", true, false);
const app = express();
let data = {};

app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/item", (req, res) => {
	const itemData = req.body;
	let id;
	
 	do {
 		id = uuidv4();
 	} while (_.find(data, (item, key) => key === id));

 	const item = {
 		band: itemData.band || '',
		title: itemData.title || '',
		year: itemData.year || '',
		format: itemData.format || 'CD',
		pubYear: itemData.pubYear || '',
		publisher: itemData.publisher || '',
		desc: itemData.desc || ''
 	}

 	data[id] = item;
 	db.push(`/${id}`, item);

    res.json({success: true, id});
});

app.put("/api/item", (req, res) => {
 	const {id, item } = req.body

 	if (!id || !item) {
 		res.json({success: false});
 		return;
 	}

 	data[id] = item;
 	db.push(`/${id}`, item);

    res.json({success: true, id});
});

app.delete("/api/item", (req, res) => {
	const { id } = req.body;

	if (!id || !data[id]) {
		res.json({success: false});
		return;
	}

	try {
		db.delete(`/${id}`);
		data = _.pickBy(data, (item, key) => key !== id)
		res.json({success: true, id});
	} catch (error) {
		res.json({success: false, error});
	}
});

app.get("/api/list", (req, res) => {
	res.json({success: true, data});
});

try {
	console.log('Loading data...'); // eslint-disable-line no-console
    data = db.getData("/");
    console.log('Data loaded.'); // eslint-disable-line no-console

	app.listen(app.get("port"), () => {
		console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
	});
} catch(error) {
    console.error(error);
};

