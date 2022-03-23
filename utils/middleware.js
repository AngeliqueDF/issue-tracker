const { loadFilesAsync } = require("mocha/lib/esm-utils");
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
};
