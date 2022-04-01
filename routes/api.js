"use strict";
const Issue = require("./../models/issue");
const mongoose = require("mongoose");

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
			(req, res, next) => {
				// Checks for a missing _id
				const _id = req.body["_id"];

				if (!_id) {
					const missingIdError = new Error("missing _id");
					missingIdError.name = "MissingIdField";

					next(missingIdError);
				}
				next();
			},
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
		)

		.delete(function (req, res) {
			let project = req.params.project;
		});
};
