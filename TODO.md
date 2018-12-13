# Schema Registry 
The need has arisen to develop a central register for schemas before they have been compiled to models. Once schemas have been compiled
into models by mongoose, any changes to the schema afterwards required the model to be recompiled for changes to take affect. This proves problematic in defining association since some of the time schemas need to be generated on the fly but have no way of knowing if / when that will be done. This functionality should provide the ORM a full registration of all schemas that will be available once passed to mongoose so that other schemas can alter, enhance, or improve upon them before they have been registred. Requirements for the registry:

 - ~~It must load in all potential schemas on startup before model compilation occurs~~. DONE
 - It must distinguish between models that have been defined statically through js files or dynamically through the ChimeraModel collection.

# Field Types 
A list of other common field types that should be supported based on popularity:
* Markdown
    * Primitive string field where the contents of the field should be considered propertly formatted markdown
* Currency 
    * Primitive number field where the contents of the field should be considered a currency amount. 
    * Should provide decimal place rounding
    * Should provide ISO 4217 codes
* Address 
    * Primitive object field where the nested schema should validate as address components. 
    * Should include components for:
        * Address
        * Address 2
        * City
        * State/Province
        * Postal Code
        * Country
        * Geo-Point
    * Perhaps the option to validate the actual address is legitamate?
* Function
    * TBD - Should the function be written in JS or a higher level syntax that is more simple (similar to excel functions). Should we support multi-language functions?
    *  Primitive object field where the contents of the field should be considered a function that derives the value.
    *  Should support strictly enforcing a return type  

# Default UUID as Primary Key
By default mongodb uses ObjectIDs as primary keys for new documents. Mongoose follows suit with this adds an _id property to each schema that is a mongodb ObjectID. In an effort to avoid generating vendor specific data, primary keys should default to and industry standard such as UUIDv4. 