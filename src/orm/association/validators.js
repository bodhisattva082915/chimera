import mongoose from 'mongoose';

export const fromModelReverseNameUniqueUniversally = {
	validator: async function (value) {
		const model = this.constructor;
		const baseModel = mongoose.model(model.baseModelName);

		if (value) {
			let count = await baseModel.find({
				'fromModelId': this.fromModelId,
				'fromModel.reverseName': value
			}).countDocuments();
			return (count === 0);
		}

		return true;
	},
	message: 'Error, expected `{PATH}` to be unique. Value: `{VALUE}`',
	type: 'unique'
};

export const fromModelReverseNameUniqueSecondary = {
	validator: async function (value) {
		const model = this.constructor;
		const baseModel = mongoose.model(model.baseModelName);

		if (!value) {
			let count = await baseModel.find({
				'fromModelId': this.fromModelId,
				'toModelId': this.toModelId,
				'fromModel.reverseName': ''
			}).countDocuments();

			return (count === 0);
		}

		return true;
	},
	message: 'Error, expected `{PATH}` to be unique. Value: `{VALUE}`',
	type: 'unique'
};
