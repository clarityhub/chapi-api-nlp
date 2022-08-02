const { Controller } = require('@clarityhub/harmony-server');

module.exports = class USEController extends Controller {
	embed(utterances) {
		return this.ioc.USE.embed(utterances);
	}
};
