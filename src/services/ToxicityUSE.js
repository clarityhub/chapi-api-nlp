const tf = require('@tensorflow/tfjs-node');
const { Tokenizer } = require('@tensorflow-models/universal-sentence-encoder');

const ML_S3_BUCKET_URL = 'http://ml.clarityhub.io.s3-website-us-west-2.amazonaws.com/';
const GRAPH_MODEL_URL = `${ML_S3_BUCKET_URL}toxicity/tensor-model.json`;
const VOCABULARY_URL = `${ML_S3_BUCKET_URL}use/tensor-vocab.json`;

/**
 * Toxicity Universal Sentence Encoder loader class
 */
class ToxicityUniversalSentenceEncoder {
	constructor(toxicityLabels = []) {
		this.toxicityLabels = toxicityLabels;
		this.loaded = false;
	}

	async loadTokenizer() {
		const file = await tf.util.fetch(VOCABULARY_URL);
		const vocabulary = await file.json();

		const tokenizer = new Tokenizer(vocabulary);

		return tokenizer;
	}

	async load() {
		const [model, tokenizer] = await Promise.all([
			tf.loadGraphModel(GRAPH_MODEL_URL),
			this.loadTokenizer(),
		]);

		this.model = model;
		this.tokenizer = tokenizer;

		this.labels = model.outputs.map(d => d.name.split('/')[0]);

		if (this.toxicityLabels.length === 0) {
			this.toxicityLabels = this.labels;
		} else {
			tf.util.assert(
				this.toxicityLabels.every(d => this.labels.indexOf(d) > -1),
				() => 'toxicityLabels argument must contain only items from the model '
                    + `heads ${this.labels.join(', ')}, `
                    + `got ${this.toxicityLabels.join(', ')}`
			);
		}

		this.loaded = true;
	}

	/**
     * Returns an array of objects, one for each label, that contains
     * the raw probabilities for each input along with the final prediction
     * boolean given the threshold. If a prediction falls below the threshold,
     * `null` is returned.
     *
     * @param inputs A string or an array of strings to classify.
     */
	async classify(inputs, options = {}) {
		if (typeof inputs === 'string') {
			inputs = [inputs];
		}

		if (!this.loaded) {
			await this.load();
		}

		const threshold = options.threshold || 0.75;

		// XXX This takes the most amount of time
		const encodings = inputs.map(d => this.tokenizer.encode(d));

		// TODO: revive once the model is robust to padding
		// const encodings = inputs.map(d => padInput(this.tokenizer.encode(d)));

		const indicesArr = encodings.map((arr, i) => arr.map((d, index) => [i, index]));

		let flattenedIndicesArr = [];

		for (let i = 0; i < indicesArr.length; i++) {
			flattenedIndicesArr = flattenedIndicesArr.concat(indicesArr[i]);
		}

		const indices = tf.tensor2d(
			flattenedIndicesArr, [flattenedIndicesArr.length, 2], 'int32'
		);
		const values = tf.tensor1d(tf.util.flatten(encodings), 'int32');

		const labels = await this.model.executeAsync(
			{ Placeholder_1: indices, Placeholder: values }
		);

		indices.dispose();
		values.dispose();

		return labels
			.map((d, i) => ({ data: d, headIndex: i }))
			.filter(
				d => this.toxicityLabels.indexOf(this.labels[d.headIndex]) > -1
			)
			.map((d) => {
				const prediction = d.data.dataSync();
				const results = [];
				for (let input = 0; input < inputs.length; input++) {
					const probabilities = prediction.slice(input * 2, input * 2 + 2);
					let match = null;

					if (Math.max(probabilities[0], probabilities[1]) > threshold) {
						match = probabilities[0] < probabilities[1];
					}

					results.push({ probabilities, match });
				}

				return { label: this.labels[d.headIndex], results };
			});
	}
}

let singleton = null;

module.exports = function toxicityUSE(Logger) {
	if (!singleton) {
		singleton = new ToxicityUniversalSentenceEncoder(Logger);
	}

	return singleton;
};
