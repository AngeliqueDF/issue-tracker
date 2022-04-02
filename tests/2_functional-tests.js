const chaiHttp = require("chai-http");
const chai = require("chai");
const assert = chai.assert;
const server = require("../server");

chai.use(chaiHttp);

const helper = require("./../utils/helper");

const mongoose = require("mongoose");
const Issue = require("./../models/issue");
const issue = require("./../models/issue");

suite("Functional Tests", function () {
	const API_URL = "/api/issues";

	const ALL_FIELDS_POST_REQUEST = {
		issue_title: "A request with all fields",
		issue_text: "When we post data it has an error.",
		created_by: "Joe",
		assigned_to: "Joe",
		status_text: "In QA",
	};

	suite("POST requests to /api/issues/{project}", function () {
		const POST_PROJECT = "post_requests";
		const POST_TESTS_URL = API_URL + "/" + POST_PROJECT;

		this.beforeEach((done) => {
			this.timeout(10000);
			done();
		});

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
					done();
				});
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
					done();
				});
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
					done();
				});
		});
	});

	suite("GET requests to /api/issues/{project}", function () {
		const GET_PROJECT_ONE = "get_requests";
		const GET_TESTS_URL = API_URL + "/" + GET_PROJECT_ONE;

		const ISSUE_ONE = {
			issue_title: "Issue 1 title",
			issue_text: "Issue 1 text",
			created_by: "author 1",
		};
		const ISSUE_TWO = {
			issue_title: "Issue 2 title",
			issue_text: "Issue 2 text",
			created_by: "author 2",
			assigned_to: "User 1",
			status_text: "status text",
		};
		const ISSUE_THREE = {
			issue_title: "Issue 3 title",
			issue_text: "Issue 3 text",
			created_by: "author 3",
			assigned_to: "User 1",
			status_text: "status text",
			open: "false",
		};

		beforeEach(function (done) {
			this.timeout(10000);
			[ISSUE_ONE, ISSUE_TWO, ISSUE_THREE].forEach(async (issue) => {
				chai
					.request(server)
					.post(GET_TESTS_URL)
					.set("Content-Type", "application/json")
					.send(issue)
					.end(function (err, res) {
						// console.log(res.status);
						// console.log("request body:", res.body);
						// console.log("error:", err);
					});
			});
			done();
		});

		afterEach(async function () {
			await Issue.deleteMany({});
		});

		test("Return all fields for each issue returned", function (done) {
			chai
				.request(server)
				.get(GET_TESTS_URL)
				.set("Content-Type", "application/json")
				.end(function (err, res) {
					// Finding ISSUE_THREE
					const returnedIssueThree = res.body.find(
						(i) => i.issue_title === ISSUE_THREE.issue_title
					);

					// Checking all the keys are present in the issue
					assert.hasAllKeys(returnedIssueThree, [
						...Object.keys(ISSUE_THREE),
						"created_on",
						"updated_on",
						"_id",
					]);

					// Checking all the values provided in the request match in the reponse
					assert.propertyVal(
						returnedIssueThree,
						"issue_title",
						ISSUE_THREE.issue_title
					);

					assert.propertyVal(
						returnedIssueThree,
						"issue_text",
						ISSUE_THREE.issue_text
					);
					assert.propertyVal(
						returnedIssueThree,
						"created_by",
						ISSUE_THREE.created_by
					);
					assert.propertyVal(
						returnedIssueThree,
						"assigned_to",
						ISSUE_THREE.assigned_to
					);
					assert.propertyVal(
						returnedIssueThree,
						"status_text",
						ISSUE_THREE.status_text
					);
					assert.propertyVal(
						returnedIssueThree,
						"open",
						JSON.parse(ISSUE_THREE.open)
					);
					done();
				});
		});

		test("Return an array of all issues for the project specified in the URL", function (done) {
			// Adding an issue for a different project, 'different_project', than the others which belong to the 'get_requests' project.
			chai
				.request(server)
				.post(API_URL + "/different_project")
				.send({
					issue_title: "Issue for a different project",
					issue_text: "Text of issue belonging to a different project",
					created_by: "Different project issue author",
				})
				.end(function (err, res) {
					// console.log("Test issue added for different_project", res.body);

					// Requesting all issues for 'different_project'
					chai
						.request(server)
						.get(API_URL + "/different_project")
						.set("Content-Type", "application/json")
						.end(function (err, res) {
							assert.lengthOf(res.body, 1);
							assert.include(res.body[0], {
								issue_title: "Issue for a different project",
							});
							assert.include(res.body[0], {
								issue_text: "Text of issue belonging to a different project",
							});
							assert.include(res.body[0], {
								created_by: "Different project issue author",
							});
							done();
						});
				});
		});

		test("Allow filtering the request by passing a field and value as a URL query", function (done) {
			const URL_QUERY = {
				open: false,
			};
			chai
				.request(server)
				.get(GET_TESTS_URL)
				.query(URL_QUERY)
				.end(function (err, res) {
					assert.include(res.body[0], {
						...ISSUE_THREE,
						open: JSON.parse(ISSUE_THREE.open),
					});
					done();
				});
		});

		test("Allow filtering the request by passing multiple fields and values as a URL query", function (done) {
			const URL_QUERY = {
				created_by: ISSUE_TWO.created_by,
				open: "true",
			};
			chai
				.request(server)
				.get(GET_TESTS_URL)
				.query(URL_QUERY)
				.end(function (err, res) {
					assert.include(res.body[0], {
						...ISSUE_TWO,
						open: JSON.parse(URL_QUERY.open),
					});
					done();
				});
		});
	});

	suite('PUT requests to "/api/issues/{project}"', function () {
		const PUT_TESTS_URL = API_URL + "/put_requests/";
		beforeEach(function (done) {
			chai
				.request(server)
				.post(PUT_TESTS_URL)
				.send(ALL_FIELDS_POST_REQUEST)
				.end((err, res) => {
					// console.log("test issue added", res.body);
					this.timeout(10000);
					done();
				});
		});

		afterEach(function () {
			Issue.deleteMany({});
		});

		test("Update one field on an issue", function (done) {
			const UPDATE_ONE_FIELD_REQUEST_BODY = {
				issue_title: "Issue title modified by PUT request.",
			};
			this.timeout(10000);
			chai
				.request(server)
				.get(PUT_TESTS_URL)
				.end((err, res) => {
					// Find the issue to update
					const { _id } = res.body[0];

					chai
						.request(server)
						.put(PUT_TESTS_URL)
						.send({ ...UPDATE_ONE_FIELD_REQUEST_BODY, _id })
						.end((err, res) => {
							// Update the issue
							chai
								.request(server)
								.get(PUT_TESTS_URL)
								.end(function (err, res) {
									// Assert it was updated
									assert.equal(
										res.body[0].issue_title,
										UPDATE_ONE_FIELD_REQUEST_BODY.issue_title
									);
								});
						});
					done();
				});
		});

		test("Update multiple fields on an issue", function (done) {
			this.timeout(10000);
			const UPDATE_MULTIPLE_FIELDS_REQUEST_BODY = {
				issue_title: "Issue title modified by PUT request.",
				issue_text: "Issue text modified by PUT request.",
				assigned_to: "Angélique",
			};
			chai
				.request(server)
				.get(PUT_TESTS_URL)
				.end((err, res) => {
					// Find the issue's _id to update it
					const { _id } = res.body[0];

					// Update the issue
					chai
						.request(server)
						.put(PUT_TESTS_URL)
						.send({ ...UPDATE_MULTIPLE_FIELDS_REQUEST_BODY, _id })
						.end((err, res) => {
							// Find the updated issue
							chai
								.request(server)
								.get(PUT_TESTS_URL)
								.end(function (err, res) {
									// Check all fields updated have the correct value
									assert.equal(
										res.body[0].issue_title,
										UPDATE_MULTIPLE_FIELDS_REQUEST_BODY.issue_title
									);
									assert.equal(
										res.body[0].issue_text,
										UPDATE_MULTIPLE_FIELDS_REQUEST_BODY.issue_text
									);
									assert.equal(
										res.body[0].assigned_to,
										UPDATE_MULTIPLE_FIELDS_REQUEST_BODY.assigned_to
									);
								});
						});
					done();
				});
		});

		test("On success, return {  result: 'successfully updated', '_id': _id } in JSON", function (done) {
			const UPDATE_ONE_FIELD_REQUEST_BODY = {
				assigned_to: "Angélique",
			};
			chai
				.request(server)
				.get(PUT_TESTS_URL)
				.end((err, res) => {
					const { _id } = res.body[0];

					chai
						.request(server)
						.put(PUT_TESTS_URL)
						.send({ ...UPDATE_ONE_FIELD_REQUEST_BODY, _id })
						.end((err, res) => {
							// The _id is changed by the server, but we can validate the new one
							assert.isTrue(mongoose.Types.ObjectId.isValid(res.body["_id"]));
							assert.equal(res.body.result, "successfully updated");
						});
					done();
				});
		});

		test("When no _id is provided, return { error: 'missing _id' } in JSON", function (done) {
			this.timeout(10000);
			const UPDATE_ONE_FIELD_REQUEST_BODY = {
				assigned_to: "Angélique",
			};
			chai
				.request(server)
				.put(PUT_TESTS_URL)
				.send({ UPDATE_ONE_FIELD_REQUEST_BODY })
				.end((err, res) => {
					assert.equal(res.body.error, "missing _id");
				});
			done();
		});

		test("When no field to update is provided, return { error: 'no update field(s) sent', '_id': _id } in JSON", function (done) {
			chai
				.request(server)
				.get(PUT_TESTS_URL)
				.end((err, res) => {
					const { _id } = res.body[0];

					chai
						.request(server)
						.put(PUT_TESTS_URL)
						.send({ _id })
						.end((err, res) => {
							assert.equal(res.body.error, "no update field(s) sent");
						});
					done();
				});
		});

		test("On any other error, return { error: 'could not update', '_id': _id } in JSON", function (done) {
			chai
				.request(server)
				.put(PUT_TESTS_URL)
				.send({ _id: "invalid id", issue_title: "issue title" })
				.end((err, res) => {
					assert.equal(res.body.error, "could not update");
				});
			done();
		});
	});

	suite.only("DELETE requests to /api/issues/{project}", function () {
		const DELETE_TESTS_URL = API_URL + "/delete_requests/";
		beforeEach(function (done) {
			chai
				.request(server)
				.post(DELETE_TESTS_URL)
				.send(ALL_FIELDS_POST_REQUEST)
				.end((err, res) => {
					done();
				});
		});

		afterEach(function (done) {
			issue.deleteMany({});
			done();
		});

		test("Delete an issue when the _id is provided", function (done) {
			// Finding the _id of the issue added in the beforeEach hook
			chai
				.request(server)
				.get(DELETE_TESTS_URL)
				.end((err, res) => {
					const { _id } = res.body[0];

					// Sending the DELETE request
					chai
						.request(server)
						.delete(DELETE_TESTS_URL)
						.send({ _id })
						.end((err, res) => {
							// Requesting all issues belonging to the delete_requests project
							chai
								.request(server)
								.get(DELETE_TESTS_URL)
								.end((err, res) => {
									const deletedIssue = res.body.find((i) => i["_id"] === _id);

									// Asserting the issue was deleted
									assert.isUndefined(deletedIssue);
									assert.lengthOf(res.body, 0);

									done();
								});
						});
				});
		});
	});
});
