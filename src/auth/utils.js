import argon2 from 'argon2';

export const encryptPassword = password => {
	return argon2.hash(password);
};
