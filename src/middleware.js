import { validationResult } from 'express-validator/check';

/**
 * Handles checking for validation errors arising from express-validator
 */
export const validationErrors = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.status(422).json({ errors: errors.array() });
	}

	next();
};
