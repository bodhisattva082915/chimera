import mongoose from 'mongoose';
import modelClass from './class';
import schema from './schema';

const ChimeraModel = mongoose.model(modelClass, schema);

export default ChimeraModel;
