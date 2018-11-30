import mongoose from 'mongoose';
import schema from './schema';

const ChimeraField = mongoose.model('ChimeraField', schema);

export default ChimeraField;
