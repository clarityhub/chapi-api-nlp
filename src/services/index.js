// Global fetch is required for the USE services
global.fetch = require('node-fetch');

/* eslint-disable-next-line import/no-extraneous-dependencies */
const AWS = require('aws-sdk');
const Bottle = require('bottlejs');

const RawDynamoDB = require('./RawDynamoDB');
const DynamoDB = require('./DynamoDB');
const USE = require('./USE');
const ToxicityUSE = require('./ToxicityUSE');
const SimpleNLP = require('./SimpleNLP');
const Report = require('./Report');
const Logger = require('./Logger');

module.exports.createBottle = function createBottle() {
	const bottle = new Bottle();

	bottle.factory('AWS', () => AWS);
	bottle.service('RawDynamoDB', RawDynamoDB, 'AWS');
	bottle.service('DynamoDB', DynamoDB, 'AWS', 'RawDynamoDB');
	bottle.service('USE', USE, 'Logger');
	bottle.service('ToxicityUSE', ToxicityUSE);
	bottle.service('SimpleNLP', SimpleNLP);
	bottle.service('Report', Report);
	bottle.service('Logger', Logger);

	return bottle;
};

module.exports.bootstrapBottle = async function bootstrapBottle(/* bottle */) {
	// Bootstrap any connections that must exist

};
