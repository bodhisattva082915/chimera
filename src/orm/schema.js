import camelCase from "lodash";
import mongoose from "mongoose";

class ChimeraSchemaError extends Error {};

class ChimeraSchema extends mongoose.Schema {

    /**
     * Creates a one-to-many association, treating this schema as the child of the relationship.
     * @param {string} modelName - The name of the mongoose model to associate.
     * @param {object} [options] - Configuration options for the virtual field declaration.
     * @param {string} [options.localField] - The name of the field in this schema that holds the foreign key reference.localField
     * @param {string} [options.foreignField] - The name of the field on the associated schema that matches the foreign key reference.
     * @param {string} [options.as] - The name to use for the virtual field that describes the association.
     * @param {object} [schemaOptions] - Mongoose schema type options to pass to the localField declaration. 
     */
    belongsTo(modelName, options = {}, schemaOptions = {}){
        if(!modelName){
            throw new ChimeraSchemaError(`Missing required parameter 'modelName'.`)
        }

        const ref = modelName;

        const localField = options.localField || `${camelCase(modelName)}Id`;
        if(!this.path(localField)){
            this.add({
                [localField]: {
                    ...schemaOptions,
                    type: mongoose.Schema.Types.ObjectId,
                    ref
                }
            });
        }

        const associationName = options.as || camelCase(modelName);
        const association = {
            ref,
            localField,
            foreignField: options.foreignField || '_id',
            justOne: true
        }

        this.virtual(associationName, association);

        return this;
    }

}

export default ChimeraSchema;