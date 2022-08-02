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

const languagePostRequestSchema = require('../../schemas/languagePostRequest.json');
const languagePostResponseSchema = require('../../schemas/languagePostResponse.json');
const sentimentPostRequestSchema = require('../../schemas/sentimentPostRequest.json');
const sentimentPostResponseSchema = require('../../schemas/sentimentPostResponse.json');
const topicsPostRequestSchema = require('../../schemas/topicsPostRequest.json');
const topicsPostResponseSchema = require('../../schemas/topicsPostResponse.json');

module.exports.language = middy(async (event, context) => {
	const { utterances } = event.body;

	// TODO create language controller
	return {
		items: await Promise.all(utterances.map(async (utterance) => {
			const { language } = await context.bottle.container.SimpleNLP
				.getSentimentAndLanguage(utterance);

			return {
				utterance,
				language,
			};
		})),
	};
})
	.use(reportUsage())
	.use(bodyParser())
	.use(httpHeaderNormalizer())
	.use(wrapBottle())
	.use(bodyValidator({
		inputSchema: languagePostRequestSchema,
		outputSchema: languagePostResponseSchema,
		ajvOptions: {
			allErrors: true,
		},
	}))
	.use(httpErrorHandler())
	.use(httpSuccessHandler());

module.exports.sentiment = middy(async (event, context) => {
	const { utterances } = event.body;

	// TODO create language controller
	return {
		items: await Promise.all(utterances.map(async (utterance) => {
			const { comparative, vote } = await context.bottle.container.SimpleNLP
				.getSentimentAndLanguage(utterance);

			return {
				utterance,
				comparative,
				vote,
			};
		})),
	};
})
	.use(reportUsage())
	.use(bodyParser())
	.use(httpHeaderNormalizer())
	.use(wrapBottle())
	.use(bodyValidator({
		inputSchema: sentimentPostRequestSchema,
		outputSchema: sentimentPostResponseSchema,
		ajvOptions: {
			allErrors: true,
		},
	}))
	.use(httpErrorHandler())
	.use(httpSuccessHandler());

module.exports.topics = middy(async (event, context) => {
	const { utterances } = event.body;

	// TODO create language controller
	return {
		items: await Promise.all(utterances.map(async (utterance) => {
			const topics = await context.bottle.container.SimpleNLP.getTopics(utterance);
			return {
				utterance,
				topics,
			};
		})),
	};
})
	.use(reportUsage())
	.use(bodyParser())
	.use(httpHeaderNormalizer())
	.use(wrapBottle())
	.use(bodyValidator({
		inputSchema: topicsPostRequestSchema,
		outputSchema: topicsPostResponseSchema,
		ajvOptions: {
			allErrors: true,
		},
	}))
	.use(httpErrorHandler())
	.use(httpSuccessHandler());
