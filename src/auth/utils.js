import argon2 from 'argon2';

export const encryptPassword = password => {
	return argon2.hash(password);
};

export const isMalformedAuthorization = ({ headers }, strategy = 'basic') => {
	const { authorization } = headers;

	if (authorization) {
		const [reqStrategy, challengeValue] = authorization.split(' ');
		if (!reqStrategy || !challengeValue) {
			return true;
		}

		switch (strategy) {
			case 'basic':
				const parsed = Buffer.from(challengeValue, 'base64').toString().split(':');
				if (parsed.length !== 2) {
					return true;
				}
				break;
		}
	}

	return false;
};
