const validator = require("validator");

module.exports = {
	/**
	 * Middleware to sanitize every value in req.body.
	 */
	sanitizeInput: (req, res, next) => {
		// Looping through req.body
		for (const key in req.body) {
			// Replacing each value by its escaped equivalent
			req.body[key] = validator.escape(req.body[key]);
		}
		next();
	},
	missingId: (req, res, next) => {
		// Checks for a missing _id
		const _id = req.body["_id"];

		if (!_id) {
			const missingIdError = new Error("missing _id");
			missingIdError.name = "MissingIdField";

			next(missingIdError);
		}
		next();
	},
	errorHandler: (err, req, res, next) => {
		if (err.name === "ValidationError") {
			// freeCodeCamp tests do not pass if status codes are defined
			res.json({ error: "required field(s) missing" });
		}
		if (err.name === "MissingIdField") {
			// Middleware to check the PUT request provided an _id
			res.json({ error: err.message });
		}
		if (err.name === "UpdateFieldsMissing") {
			res.json({ error: err.message, _id: err["_id"] });
		}
		if (err.name === "CouldNotUpdate") {
			res.json({ error: err.message, _id: err["_id"] });
		}
		if (req.method === "DELETE") {
			res.json({ error: "could not delete", _id: req.body["_id"] });
		}
	},
};
