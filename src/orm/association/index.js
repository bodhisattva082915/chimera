import mongoose from 'mongoose';
import schema from './schema';
import oneToMany from './oneToMany';

export const ChimeraAssociation = mongoose.model(schema.name, schema);

export const OneToMany = ChimeraAssociation.discriminator(oneToMany.name, oneToMany);

export default ChimeraAssociation;
