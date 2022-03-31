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
					done();
				});
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
		const GET_PROJECT_TWO = "get_requests";
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

		beforeEach(function () {
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
});
