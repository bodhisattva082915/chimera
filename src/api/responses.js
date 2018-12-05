import http from 'http';
import mongoose from 'mongoose';

/**
 * Express error handler for non-existent documents. Responds with statusCode 404.
 */
export function documentDoesNotExist (err, req, res, next) {
	if (err instanceof mongoose.Error.DocumentNotFoundError) {
		res.status(404).json({
			error: {
				name: err.name,
				codename: http.STATUS_CODES[404],
				message: err.message
			}
		});

		return next();
	}

	next(err);
}

/**
 * Express error handler for failed validation. Responds with statusCode 422.
 */
export function malformedRequest (err, req, res, next) {
	if (err instanceof mongoose.Error.ValidationError) {
		res.status(422).json({
			error: {
				name: err.name,
				codename: http.STATUS_CODES[422],
				message: err.message,
				validationErrors: err.errors
			}
		});

		next();
	}

	next(err);
}
