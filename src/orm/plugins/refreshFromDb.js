module.exports = function refreshFromDb (schema) {
	schema.method('refreshFromDb', function (projection = {}, options = {}) {
		return this.model(this.constructor.modelName).findById(this.id, projection, options);
	});
};
