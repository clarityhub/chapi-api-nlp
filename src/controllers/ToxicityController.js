const { Controller } = require('@clarityhub/harmony-server');

module.exports = class ToxicityController extends Controller {
	classifyUtterances(utterances, options) {
		return this.ioc.ToxicityUSE.classify(utterances, options);
	}
};
