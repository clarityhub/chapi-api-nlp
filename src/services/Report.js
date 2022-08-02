const request = require('request');

module.exports = function Report() {
	return {
		send(payload) {
			return new Promise((resolve, reject) => {
				request(`${process.env.AWS_ACCOUNTS_ENDPOINT}/report/usage`, {
					method: 'post',
					body: payload,
					json: true,
					timeout: 8 * 1000,
				}, (err, res, body) => {
					if (err) {
						reject(err);
					}

					resolve(body);
				});
			});
		},
	};
};
