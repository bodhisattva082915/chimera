import mongoose from 'mongoose';
import schema from './schema';
import oneToMany from './oneToMany';
import oneToOne from './oneToOne';
import manyToMany from './manyToMany';

export const ChimeraAssociation = mongoose.model(schema.name, schema);

export const OneToMany = ChimeraAssociation.discriminator(oneToMany.name, oneToMany);
export const OneToOne = ChimeraAssociation.discriminator(oneToOne.name, oneToOne);
export const ManyToMany = ChimeraAssociation.discriminator(manyToMany.name, manyToMany);

export default ChimeraAssociation;
