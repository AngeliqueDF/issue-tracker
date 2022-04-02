"use strict";
const { findOneAndUpdate } = require("./../models/issue");
const Issue = require("./../models/issue");
const mongoose = require("mongoose");
const middleware = require("./../utils/middleware");

module.exports = function (app) {
	app
		.route("/api/issues/:project")

		.get(async (req, res) => {
			let project = req.params.project;
			try {
				const issues = await Issue.find({ project, ...req.query }).exec();
				res.json(issues);
			} catch (error) {
				console.log(error);
				next(error);
			}
		})

		.post(async (req, res, next) => {
			let project = req.params.project;

			const issue = new Issue({
				...req.body,
				project,
				assigned_to: req.body.assigned_to || "",
				status_text: req.body.status_text || "",
				created_on: new Date(),
				updated_on: new Date(),
				open: req.body.open || true,
			});
			try {
				const savedIssue = await issue.save();
				res.json(savedIssue);
			} catch (error) {
				next(error);
			}
		})

		.put(
			middleware.missingId,
			(req, res, next) => {
				// Checks the _id is valid
				const { _id } = req.body;
				idIsValid = mongoose.Types.ObjectId.isValid(_id);

				if (idIsValid === false) {
					const CouldNotUpdate = new Error("could not update");
					CouldNotUpdate.name = "CouldNotUpdate";
					next(CouldNotUpdate);
				}
				next();
			},
			(req, res, next) => {
				// Checks fields to update were provided
				const fieldsProvided = Object.keys(req.body);
				const nbFields = fieldsProvided.length;

				if (nbFields === 1 && fieldsProvided[0] === "_id") {
					const updateFieldsMissing = new Error("no update field(s) sent");
					updateFieldsMissing.name = "UpdateFieldsMissing";
					updateFieldsMissing["_id"] = _id;

					next(updateFieldsMissing);
				}
				next();
			},
			async (req, res, next) => {
				// Updates the issue
				// let project = req.params.project;
				const { _id: filter, ...update } = req.body;
				try {
					const updatedIssue = await Issue.findByIdAndUpdate(
						filter,
						{ ...update, updated_on: new Date() },
						{
							new: true,
						}
					);
					res.json({
						result: "successfully updated",
						_id: updatedIssue["_id"],
					});
				} catch (error) {
					console.log(error);
				}
			}
		)

		.delete(async function (req, res) {
			try {
				const deletedIssue = await Issue.findByIdAndDelete(req.body["_id"]);
				res.json({ result: "successfully deleted", _id: deletedIssue["_id"] });
			} catch (error) {
				console.log(error);
			}
		});
};
