import mongoose from 'mongoose';
import schema from './schema';
import oneToMany from './oneToMany';
import oneToOne from './oneToOne';

export const ChimeraAssociation = mongoose.model(schema.name, schema);

export const OneToMany = ChimeraAssociation.discriminator(oneToMany.name, oneToMany);
export const OneToOne = ChimeraAssociation.discriminator(oneToOne.name, oneToOne);

export default ChimeraAssociation;
