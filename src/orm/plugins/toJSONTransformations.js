module.exports = schema => {
	schema.set('toJSON', {
		virtuals: true,
		transform: (doc, ret) => {
			delete ret._id;
			return ret;
		}
	});
};
