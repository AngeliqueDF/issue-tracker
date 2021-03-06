"use strict";
const Issue = require("./../models/issue");
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
				// Checks fields to update were provided
				const fieldsProvided = Object.keys(req.body);
				const nbFields = fieldsProvided.length;

				if (nbFields === 1 && fieldsProvided[0] === "_id") {
					const updateFieldsMissing = new Error("no update field(s) sent");
					updateFieldsMissing.name = "UpdateFieldsMissing";
					updateFieldsMissing["_id"] = req.body["_id"];

					next(updateFieldsMissing);
				}
				next();
			},
			async (req, res, next) => {
				// Updates the issue
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
					const CouldNotUpdate = new Error("could not update");
					CouldNotUpdate.name = "CouldNotUpdate";
					CouldNotUpdate["_id"] = filter;
					next(CouldNotUpdate);
				}
			}
		)

		.delete(middleware.missingId, async function (req, res, next) {
			try {
				const deletedIssue = await Issue.findByIdAndDelete(req.body["_id"]);
				res.json({
					result: "successfully deleted",
					_id: deletedIssue["_id"],
				});
			} catch (error) {
				console.log(error);
				next(error);
			}
		});
};
