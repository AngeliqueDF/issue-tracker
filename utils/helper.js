const validator = require("validator");

module.exports = {
	/**
	 * Validates dates received from the router.
	 * @param {string} date received from the API
	 * @returns boolean
	 */
	validateDate: (date) => {
		const dateReceived = new Date(date);
		return dateReceived instanceof Date && !isNaN(dateReceived);
	},
};
