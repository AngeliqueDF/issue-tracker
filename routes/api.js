"use strict";
const Issue = require("./../models/issue");
const { sanitizeInput } = require("./../utils/middleware");

module.exports = function (app) {
	app
		.route("/api/issues/:project")

		.get(function (req, res) {
			let project = req.params.project;
		})

		.post(sanitizeInput, async (req, res, next) => {
			let project = req.params.project;


			const issue = new Issue({
				...req.body,
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
