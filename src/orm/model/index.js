import { Schema, Record } from 'js-data';
import schema from './schema.json';

export class ChimeraModel extends Record {};
export const ChimeraModelSchema = new Schema(schema);

export default {
	name: 'ChimeraModel',
	collection: 'ChimeraModel',
	schema: ChimeraModelSchema,
	recordClass: ChimeraModel
};
