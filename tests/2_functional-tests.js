const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const helper = require("./../utils/helper");
const Issue = require("./../models/issue");

const API_URL = "/api/issues";

suite("Functional Tests", function () {
	const POST_PROJECT = "post_requests";
	const POST_TESTS_URL = API_URL + "/" + POST_PROJECT;
	const ALL_FIELDS_POST_REQUEST = {
		issue_title: "A request with all fields",
		issue_text: "When we post data it has an error.",
		created_by: "Joe",
		assigned_to: "Joe",
		status_text: "In QA",
	};
	suite("POST requests to /api/issues/{project}", function () {
		test("Create an issue when all fields are provided", function (done) {
			// Doesn't include date properties "created_on" and "updated_on"
			const ALL_FIELDS_EXPECTED_RESPONSE = {
				issue_title: "A request with all fields",
				issue_text: "When we post data it has an error.",
				created_by: "Joe",
				assigned_to: "Joe",
				open: true,
				status_text: "In QA",
			};
			chai
				.request(server)
				.post(POST_TESTS_URL)
				.send(ALL_FIELDS_POST_REQUEST)
				.end((err, res) => {
					assert.equal(res.status, 200);
					assert.equal(res.type, "application/json");

					assert.property(res.body, "_id");

					assert.equal(
						res.body.issue_title,
						ALL_FIELDS_EXPECTED_RESPONSE.issue_title
					);
					assert.equal(
						res.body.issue_text,
						ALL_FIELDS_EXPECTED_RESPONSE.issue_text
					);

					assert.property(res.body, "created_on");
					assert.isTrue(helper.validateDate(res.body.created_on));
					assert.property(res.body, "updated_on");
					assert.isTrue(helper.validateDate(res.body.updated_on));

					assert.equal(
						res.body.created_by,
						ALL_FIELDS_EXPECTED_RESPONSE.created_by
					);

					assert.equal(res.body.open, ALL_FIELDS_EXPECTED_RESPONSE.open);

					assert.equal(
						res.body.assigned_to,
						ALL_FIELDS_EXPECTED_RESPONSE.assigned_to
					);

					assert.equal(
						res.body.status_text,
						ALL_FIELDS_EXPECTED_RESPONSE.status_text
					);
				});
			done();
		});

		test("Return true for the 'open' property by default", function (done) {
			chai
				.request(server)
				.post(POST_TESTS_URL)
				.send(ALL_FIELDS_POST_REQUEST)
				.end((err, res) => {
					assert.isBoolean(res.body.open);
					assert.isTrue(res.body.open);
				});
			done();
		});

		test("Return an error object when a required field is missing", function (done) {
			chai
				.request(server)
				.post(POST_TESTS_URL)
				.send({})
				.end((err, res) => {
					// freeCodeCamp tests do not pass if status codes are defined
					// assert.equal(res.status, 400);
					assert.equal(res.type, "application/json");
					assert.property(res.body, "error");
					assert.equal(res.body.error, "required field(s) missing");
				});

			done();
		});

		test("Excluded optional fields return an empty string.", function (done) {
			const requiredOnly = {
				issue_title: "Fix error in posting data",
				issue_text: "When we post data it has an error.",
				created_by: "Joe",
			};
			const requiredOnlyResponse = {
				issue_title: "Fix error in posting data",
				issue_text: "When we post data it has an error.",
				created_by: "Joe",
				assigned_to: "",
				open: true,
				status_text: "",
			};
			chai
				.request(server)
				.post(POST_TESTS_URL)
				.send(requiredOnly)
				.end((err, res) => {
					assert.equal(res.body.assigned_to, requiredOnlyResponse.assigned_to);
					assert.equal(res.body.status_text, requiredOnlyResponse.status_text);
				});

			done();
		});
	});
});
