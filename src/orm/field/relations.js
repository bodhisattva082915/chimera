export default {
	belongsTo: {
		ChimeraModel: {
			foreignKey: 'modelId',
			localField: 'model'
		}
	}
};
