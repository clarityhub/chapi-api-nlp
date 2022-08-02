const middy = require('middy');
const {
	httpHeaderNormalizer,
} = require('middy/middlewares');

const wrapBottle = require('../middleware/wrapBottle');
const httpSuccessHandler = require('../middleware/httpSuccessHandler');
const httpErrorHandler = require('../middleware/httpErrorHandler');
const bodyValidator = require('../middleware/bodyValidator');
const bodyParser = require('../middleware/bodyParser');
const reportUsage = require('../middleware/reportUsage');

const ToxicityController = require('../controllers/ToxicityController');
const toxicityPostRequestSchema = require('../../schemas/toxicityPostRequest.json');
const toxicityPostResponseSchema = require('../../schemas/toxicityPostResponse.json');

module.exports.default = middy(async (event, context) => {
	const { utterances } = event.body;
	const params = event.queryStringParameters || {};
	const { threshold, probabilities } = params;

	const hasKey = Object.keys(params).indexOf('probabilities') !== -1;
	const value = probabilities === '' ? true : Boolean(probabilities);
	const returnProbabilities = hasKey ? value : false;

	const controller = new ToxicityController(context.bottle.container);
	const results = await controller.classifyUtterances(utterances, {
		threshold: threshold ? parseFloat(threshold) : undefined,
	});

	return {
		items: utterances.map((u, i) => {
			const labels = {};

			results.forEach((r) => {
				labels[r.label] = returnProbabilities
					? r.results[i].probabilities[1]
					: r.results[i].match === true;
			});

			return {
				utterance: u,
				labels,
			};
		}),
	};
})
	.use(reportUsage())
	.use(bodyParser())
	.use(httpHeaderNormalizer())
	.use(wrapBottle())
	.use(bodyValidator({
		inputSchema: toxicityPostRequestSchema,
		outputSchema: toxicityPostResponseSchema,
		ajvOptions: {
			allErrors: true,
		},
	}))
	.use(httpErrorHandler())
	.use(httpSuccessHandler());
