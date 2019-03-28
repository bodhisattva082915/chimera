module.exports = schema => {
	schema.method('refreshFromDb', function () {
		return this.model(this.constructor.modelName).findById(this.id);
	});
};
