const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema({
	issue_title: { type: String, required: true },
	issue_text: { type: String, required: true },
	created_by: { type: String, required: true },
	assigned_to: String,
	status_text: String,
	open: { type: Boolean, required: true },
	created_on: { type: Date, required: true }, // added required to prevent unexpected values: "" will be added to the database as null. helper.validateDate() doesn't catch the error and returns the current time instead. See https://github.com/Automattic/mongoose/issues/2438
	updated_on: { type: Date, required: true },
});

issueSchema.set("toJSON", {
	transform: (document, returnedObject) => {
		returnedObject._id = returnedObject._id.toString();
		delete returnedObject.__v;
	},
});

module.exports = mongoose.model("Issue", issueSchema);
