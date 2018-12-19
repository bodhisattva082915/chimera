import mongoose from 'mongoose';

const defaultMessage = 'Error, expected `{PATH}` to be unique. Value: `{VALUE}`';

export default {
	fromModel: {
		foreignKey: {
			uniqueUniversally: {
				validator: async function (value) {
					const model = this.constructor;

					if (value && model.modelName === 'NonHierarchicalAssociation') {
						let count = await model.find({
							'fromModelId': this.fromModelId,
							'fromModel.foreignKey': value
						}).countDocuments();
						return (count === 0);
					}

					return true;
				},
				message: defaultMessage,
				type: 'unique'
			},
			uniqueSecondary: {
				validator: async function (value) {
					const model = this.constructor;

					if (!value && model.modelName === 'NonHierarchicalAssociation') {
						let count = await model.find({
							'fromModelId': this.fromModelId,
							'toModelId': this.toModelId,
							'fromModel.foreignKey': ''
						}).countDocuments();
						return (count === 0);
					}

					return true;
				},
				message: defaultMessage,
				type: 'unique'
			}
		},
		relatedName: {
			uniqueUniversally: {
				validator: async function (value) {
					const model = this.constructor;

					if (value && model.modelName === 'NonHierarchicalAssociation') {
						let count = await model.find({
							'fromModelId': this.fromModelId,
							'fromModel.relatedName': value
						}).countDocuments();
						return (count === 0);
					}

					return true;
				},
				message: defaultMessage,
				type: 'unique'
			},
			uniqueSecondary: {
				validator: async function (value) {
					const model = this.constructor;

					if (!value && model.modelName === 'NonHierarchicalAssociation') {
						let count = await model.find({
							'fromModelId': this.fromModelId,
							'toModelId': this.toModelId,
							'fromModel.relatedName': ''
						}).countDocuments();
						return (count === 0);
					}

					return true;
				},
				message: defaultMessage,
				type: 'unique'
			}
		},
		reverseName: {
			uniqueUniversally: {
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
				message: defaultMessage,
				type: 'unique'
			},
			uniqueSecondary: {
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
				message: defaultMessage,
				type: 'unique'
			}
		}
	},
	toModel: {
		foreignKey: {
			uniqueUniversally: {
				validator: async function (value) {
					const model = this.constructor;

					if (value) {
						let count = await model.find({
							'toModelId': this.toModelId,
							'toModel.foreignKey': value
						}).countDocuments();
						return (count === 0);
					}

					return true;
				},
				message: defaultMessage,
				type: 'unique'
			},
			uniqueSecondary: {
				validator: async function (value) {
					const model = this.constructor;

					if (!value) {
						let count = await model.find({
							'fromModelId': this.fromModelId,
							'toModelId': this.toModelId,
							'toModel.foreignKey': ''
						}).countDocuments();
						return (count === 0);
					}

					return true;
				},
				message: defaultMessage,
				type: 'unique'
			}
		},
		relatedName: {
			uniqueUniversally: {
				validator: async function (value) {
					const model = this.constructor;

					if (value) {
						let count = await model.find({
							'toModelId': this.toModelId,
							'toModel.relatedName': value
						}).countDocuments();
						return (count === 0);
					}

					return true;
				},
				message: defaultMessage,
				type: 'unique'
			},
			uniqueSecondary: {
				validator: async function (value) {
					const model = this.constructor;

					if (!value) {
						let count = await model.find({
							'fromModelId': this.fromModelId,
							'toModelId': this.toModelId,
							'toModel.relatedName': ''
						}).countDocuments();
						return (count === 0);
					}

					return true;
				},
				message: defaultMessage,
				type: 'unique'
			}
		},
		reverseName: {
			uniqueUniversally: {
				validator: async function (value) {
					const model = this.constructor;

					if (value && model.modelName === 'NonHierarchicalAssociation') {
						let count = await model.find({
							'toModelId': this.toModelId,
							'toModel.reverseName': value
						}).countDocuments();
						return (count === 0);
					}

					return true;
				},
				message: defaultMessage,
				type: 'unique'
			},
			uniqueSecondary: {
				validator: async function (value) {
					const model = this.constructor;

					if (!value && model.modelName === 'NonHierarchicalAssociation') {
						let count = await model.find({
							'fromModelId': this.fromModelId,
							'toModelId': this.toModelId,
							'toModel.reverseName': ''
						}).countDocuments();
						return (count === 0);
					}

					return true;
				},
				message: defaultMessage,
				type: 'unique'
			}
		}
	}
};
