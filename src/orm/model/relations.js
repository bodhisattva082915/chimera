export default {
	hasMany: {
		ChimeraField: {
			foreignKey: 'modelId',
			localField: 'fields'
		}
	}
};
