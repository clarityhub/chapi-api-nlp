/* eslint-disable no-console */
/**
 * Local version of the authorizer.
 */

const generatePolicy = (result, effect, resource) => {
	if (effect && resource) {
		return {
			principalId: result.accessKeyId,
			policyDocument: {
				Version: '2012-10-17',
				Statement: [{
					Action: 'execute-api:Invoke',
					Effect: effect,
					Resource: resource,
				}],
			},
			context: {
				organizationId: result.organizationId,
			},
			usageIdentifierKey: result.accessKeyId,
		};
	}

	return {
		principalId: result.accessKeyId,
		// No policy
	};
};

const getAccessKeysFromHeader = (authorization) => {
	const parts = authorization.split(' ');

	if (parts && parts.length && parts.length > 1) {
		const buf = Buffer.from(parts[1], 'base64');
		const plainAuth = buf.toString();

		return plainAuth.split(':');
	}

	throw new Error('Malformed authorization header');
};

/**
 * We need to pass X-Clarityhub-Organization as the bearer password when working on localhost
 *
 * @param {*} event
 */
module.exports.default = async function handler(event) {
	console.log(event);
	try {
		if (!event.authorizationToken) {
			return {
				statusCode: 402,
				message: 'Unauthenticated',
			};
		}

		// Get organization id from user:pass
		const [accessKeyId, organizationId] = getAccessKeysFromHeader(event.authorizationToken);

		return generatePolicy({
			organizationId,
			accessKeyId,
		}, 'Allow', event.methodArn);
	} catch (err) {
		console.error(err);
		return {
			statusCode: 500,
			message: 'Something bad happened',
		};
	}
};
