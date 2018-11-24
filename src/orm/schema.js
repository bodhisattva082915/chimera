import camelCase from "lodash";
import mongoose from "mongoose";

class ChimeraSchemaError extends Error {
    constructor(message){
        super(message);
        this.name = 'ChimeraSchemaError';
    }
};

class ChimeraSchema extends mongoose.Schema {

    /**
     * Creates a foriegn key association, treating this as the dependent schema of the relationship.
     * @param {string} modelName - The name of the mongoose model to associate.
     * @param {object} [options] - Configuration options for the virtual field declaration.
     * @param {string} [options.localField] - The name of the field in this schema that holds the foreign key reference.localField
     * @param {string} [options.foreignField] - The name of the field on the associated schema that matches the foreign key reference.
     * @param {string} [options.as] - The name to use for the virtual field that describes the association.
     * @param {object} [schemaOptions] - Mongoose schema type options to pass to the localField declaration. 
     * @returns {ChimeraSchema} - Mutates the schema by adding a virtual field to describe this association.
     */
    belongsTo(modelName, options = {}, schemaOptions = {}){
        if(!modelName){
            throw new ChimeraSchemaError(`Missing required parameter 'modelName'.`);
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

    /**
     * Creates a one-to-many association, treating this as the independent schema of the relationship.
     * @param {string} modelName - The name of the mongoose model to associate.
     * @param {object} options - Configuration options for the virtual field declaration.
     * @param {string} options.localField - The name of the field in this schema that holds the foreign key reference.localField
     * @param {string} [options.foreignField] - The name of the field on the associated schema that matches the foreign key reference.
     * @param {string} [options.as] - The name to use for the virtual field that describes the association.
     * @returns {ChimeraSchema} - Mutates the schema by adding a virtual field to describe this association.
     */
    hasMany(modelName, options){
        if(!modelName){
            throw new ChimeraSchemaError(`Missing required parameter 'modelName'.`);
        }

        if(!options.foreignField){
            throw new ChimeraSchemaError(`Missing required option 'foreignField'.`);
        }

        const ref = modelName;
        const foreignField = options.foreignField;
        const localField = options.localField || '_id';

        const associationName = options.as || `${camelCase(modelName)}Set`;
        const association = {
            ref,
            localField,
            foreignField
        }

        this.virtual(associationName, association);

        return this;
    }

    /**
     * Creates a one-to-one association, treating this as the independent schema of the relationship.
     * To ensure the integrity of the association, a unique index should also be placed on the on the 
     * dependent schema of the relationship to protect a one-to-many relationship from forming.
     * @param {string} modelName - The name of the mongoose model to associate.
     * @param {object} options - Configuration options for the virtual field declaration.
     * @param {string} options.localField - The name of the field in this schema that holds the foreign key reference.localField
     * @param {string} [options.foreignField] - The name of the field on the associated schema that matches the foreign key reference.
     * @param {string} [options.as] - The name to use for the virtual field that describes the association.
     * @returns {ChimeraSchema} - Mutates the schema by adding a virtual field to describe this association.
     */
    hasOne(modelName, options){
        if(!modelName){
            throw new ChimeraSchemaError(`Missing required parameter 'modelName'.`);
        }

        if(!options.foreignField){
            throw new ChimeraSchemaError(`Missing required option 'foreignField'.`);
        }

        const ref = modelName;
        const foreignField = options.foreignField;
        const localField = options.localField || `_id`;

        const associationName = options.as || `${camelCase(modelName)}`;
        const association = {
            ref,
            localField,
            foreignField,
            justOne: true
        }

        this.virtual(associationName, association);

        return this;
    }

}

export default ChimeraSchema;