"use strict";
const Issue = require("./../models/issue");
const { sanitizeInput } = require("./../utils/middleware");

module.exports = function (app) {
	app
		.route("/api/issues/:project")

		.get(sanitizeInput, async (req, res) => {
			let project = req.params.project;
			try {
				const issues = await Issue.find({ project, ...req.query }).exec();
				res.json(issues);
			} catch (error) {
				console.log(error);
				next(error);
			}
		})

		.post(sanitizeInput, async (req, res, next) => {
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

		.put(function (req, res) {
			let project = req.params.project;
		})

		.delete(function (req, res) {
			let project = req.params.project;
		});
};
