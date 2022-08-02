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

const USEController = require('../controllers/USEController');
const embedPostRequestSchema = require('../../schemas/embedPostRequest.json');
const embedPostResponseSchema = require('../../schemas/embedPostResponse.json');

module.exports.embed = middy(async (event, context) => {
	const { utterances } = event.body;

	const controller = new USEController(context.bottle.container);
	const results = await controller.embed(utterances);

	return {
		items: utterances.map((u, i) => {
			return {
				utterance: u,
				embedding: results[i],
			};
		}),
	};
})
	.use(reportUsage())
	.use(bodyParser())
	.use(httpHeaderNormalizer())
	.use(wrapBottle())
	.use(bodyValidator({
		inputSchema: embedPostRequestSchema,
		outputSchema: embedPostResponseSchema,
		ajvOptions: {
			allErrors: true,
		},
	}))
	.use(httpErrorHandler())
	.use(httpSuccessHandler());
