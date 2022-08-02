const nlp = require('compromise');
const sentiment = require('node-sentiment');

// TODO train a USE model on sentiment
// const customWords = {
// 	suck: -1,
// 	faggot: -2,
// };

class SimpleNLP {
	async getSentimentAndLanguage(utterance) {
		const { comparative, vote, language } = sentiment(utterance);

		return {
			comparative,
			vote,
			language,
		};
	}

	async getTopics(utterance) {
		const doc = nlp(utterance);

		const topics = doc.topics().out('array');
		const nouns = doc.nouns().out('array');

		return topics.length > 0 ? topics : nouns;
	}
}

module.exports = function simpleNLP() {
	return new SimpleNLP();
};
