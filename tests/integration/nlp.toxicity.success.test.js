const toxicity = require('../../src/routes/toxicity').default;

describe('POST /nlp/toxicity', () => {
	test('Toxicity', async () => {
		const MOCK_EVENT = {
			path: '/nlp/toxicity',
			body: '{"utterances": ["You smell"]}',
			requestContext: {
				httpMethod: 'POST',
			},
		};

		const response = await new Promise((resolve, reject) => {
			toxicity(MOCK_EVENT, {}, (err, res) => {
				if (err) {
					reject(err);
				}
				resolve(res);
			});
		});

		console.log(response);

		expect(response.statusCode).toEqual(200);
		expect(typeof response.body).toBe('string');
	});
});
