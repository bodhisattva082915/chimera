/**
 * [mongoose-plugin]
 * Provides support for predictable relations (and reverse-relations) management between models. 
 * This is done by  binding a static method to each model creates virtual properties on both 
 * endpoints of each reference field that describe how the relationsip between them exists. 
 * This allows for document population from either side of the relationship. 
 */
import { flow, pickBy, reduce, each } from 'lodash';

export default function(schema){
    schema.static('associate', function(){
        flow(
            /** Filter fields to only reference fields */
            fields => pickBy(fields, field => field.ref),
    
            /** Create associations based on the reference definition */
            refs => reduce(refs, (associations, refField, fieldName) => {
                const associationName = refField.as || fieldName.replace('Id', '');
                const association = {
                    ref: refField.ref,
                    localField: fieldName,
                    foreignField: '_id',
                    justOne: true
                }
                
                associations[associationName] = association;
    
                return associations;
            }, {}),
    
            /** Bind static method to allow the model to  build its own associations */
            associations => each(associations, (association, associationName) => {
                schema.virtual(associationName, association);
            })
        )(schema.obj);
    });
}