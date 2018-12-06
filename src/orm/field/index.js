import mongoose from 'mongoose';
import schema from './schema';
import './types';

const ChimeraField = mongoose.model('ChimeraField', schema);

export default ChimeraField;
