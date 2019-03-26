import { validationResult } from 'express-validator/check';

/**
 * Enforces checks and handles validation errors arising from express-validator
 */
export const validateReq = (...validators) => {
	const validationErrors = (req, res, next) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(422).json({ errors: errors.array() });
		}

		next();
	};

	return [...validators, validationErrors];
};
