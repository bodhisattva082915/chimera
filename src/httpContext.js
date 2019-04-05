import cls from 'cls-hooked';

/**
 * Adds in thread-local variable support.
 */
const context = cls.createNamespace('httpContext');

export default {
	initialize () {
		return function (req, res, next) {
			context.bindEmitter(req);
			context.bindEmitter(res);
			context.run(function () {
				next();
			});
		};
	}
};
