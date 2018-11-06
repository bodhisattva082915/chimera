import { Mapper, Schema } from "js-data";
import schema from "./schema.json";

export const ChimeraModelSchema = new Schema(schema);

export default new Mapper({
    name: 'chimera',
    schema: ChimeraModelSchema
});