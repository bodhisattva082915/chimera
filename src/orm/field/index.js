import { Record } from 'js-data';
import schema from './schema';
import relations from './relations';
import ChimeraSchema from '../Schema';

class ChimeraField extends Record {};

export default {
	collection: 'ChimeraField',
	recordClass: ChimeraField,
	schema: new ChimeraSchema(schema),
	relations
};
