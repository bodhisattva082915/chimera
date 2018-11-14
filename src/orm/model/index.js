import mongoose from 'mongoose';
import schema from './schema';

const ChimeraModel = mongoose.model('ChimeraModel', schema);

export default ChimeraModel;
