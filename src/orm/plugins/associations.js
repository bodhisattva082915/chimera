/**
 * [mongoose-plugin]
 * Provides support for predictable relations (and reverse-relations) management between models. 
 * This is done by  binding a static method to each model creates virtual properties on both 
 * endpoints of each reference field that describe how the relationsip between them exists. 
 * This allows for document population from either side of the relationship. 
 */
// import { pickBy, reduce, each, camelCase } from 'lodash';
// import mongoose from 'mongoose';

// export default function(schema){
//     schema.set('toObject', { virtuals: true });
//     schema.set('toJSON', { virtuals: true });

//     schema.static('associate', function(){
        
//         /** Filter fields to only reference fields */
//         const refs = pickBy(schema.obj, field => field.ref);

//         /** Create associations based on the reference definitions */
//         const associations = reduce(refs, (associations, refField, fieldName) => {
//             const associationName = refField.as || fieldName.replace('Id', '');
//             const association = {
//                 ref: refField.ref,
//                 localField: fieldName,
//                 foreignField: '_id',
//                 justOne: true
//             }

//             associations[associationName] = association;

//             return associations;
//         }, {});

//         /** Create reverse associations based on the reference definitions */
//         const reverseAssociations = reduce(refs, (reverseAssociations, refField, fieldName) => {
//             const reverseAssociationName = refField.relatedName || `${camelCase(this.modelName)}Set`
//             const reverseAssociation = {
//                 ref: this.modelName,
//                 reverseRef: refField.ref,
//                 localField: '_id',
//                 foreignField: fieldName
//             }

//             reverseAssociations[reverseAssociationName] = reverseAssociation;

//             return reverseAssociations;
//         }, {});

//         /** Bind virtuals that will populate associations */
//         each(associations, (association, associationName) => {
//             schema.virtual(associationName, association);
//         });

//         /** Bind virtuals that will populate reverse associations */
//         each(reverseAssociations, (association, associationName) => {
//             const { reverseRef: modelName, ...reverseAssociation } = association;
//             const model = mongoose.model(modelName);

//             model.schema.virtual(associationName, reverseAssociation);
//         });
//     });
// }