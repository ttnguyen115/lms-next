import mongoose from "mongoose";

export function isValidMongoTypesObjectId(
    id:
        | string
        | number
        | mongoose.mongo.BSON.ObjectId
        | mongoose.mongo.BSON.ObjectIdLike
        | Uint8Array
): boolean {
    return mongoose.Types.ObjectId.isValid(id);
}
