const tf = require('@tensorflow/tfjs-node');
const { Tokenizer } = require('@tensorflow-models/universal-sentence-encoder');

const ML_S3_BUCKET_URL = 'http://ml.clarityhub.io.s3-website-us-west-2.amazonaws.com/';
const GRAPH_MODEL_URL = `${ML_S3_BUCKET_URL}use/tensor-model.json`;
const VOCABULARY_URL = `${ML_S3_BUCKET_URL}use/tensor-vocab.json`;

/**
 * Universal Sentence Encoder loader class
 */
class UniversalSentenceEncoder {
	constructor(Logger) {
		this.loaded = false;
		this.Logger = Logger;
	}

	async loadTokenizer() {
		const file = await tf.util.fetch(VOCABULARY_URL);
		const vocabulary = await file.json();

		const tokenizer = new Tokenizer(vocabulary);

		return tokenizer;
	}

	async load() {
		this.Logger.log('Loading model from scratch');

		const [model, tokenizer] = await Promise.all([
			tf.loadGraphModel(GRAPH_MODEL_URL),
			this.loadTokenizer(),
		]);

		this.model = model;
		this.tokenizer = tokenizer;
		this.loaded = true;
	}

	/**
     *
     * Returns a 2D Tensor of shape [input.length, 512] that contains the
     * Universal Sentence Encoder embeddings for each input.
     *
     * @param inputs A string or an array of strings to embed.
     */
	async embed(inputs) {
		if (typeof inputs === 'string') {
			inputs = [inputs];
		}

		if (!this.loaded) {
			await this.load();
		}

		// XXX This takes the most amount of time
		const encodings = inputs.map(d => this.tokenizer.encode(d));

		const indicesArr = encodings.map((arr, i) => arr.map((d, index) => [i, index]));

		let flattenedIndicesArr = [];
		for (let i = 0; i < indicesArr.length; i++) {
			flattenedIndicesArr = flattenedIndicesArr.concat(indicesArr[i]);
		}

		const indices = tf.tensor2d(
			flattenedIndicesArr, [flattenedIndicesArr.length, 2], 'int32'
		);
		const values = tf.tensor1d(tf.util.flatten(encodings), 'int32');

		const embeddings = await this.model.executeAsync({ indices, values });

		indices.dispose();
		values.dispose();

		const arr = await embeddings.array();

		return arr;
	}
}

let singleton = null;

module.exports = function use(Logger) {
	if (!singleton) {
		singleton = new UniversalSentenceEncoder(Logger);
	}

	return singleton;
};
