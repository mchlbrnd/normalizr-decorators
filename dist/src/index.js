"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const normalizr = require("normalizr");
require("reflect-metadata");
exports.REFLECT_METADATA_SCHEMA = 'normalizr.schema';
exports.REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES = 'normalizr.entity.properties';
exports.REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES = 'normalizr.array.properties';
exports.Entity = (params) => EntityClassDecorator(params);
exports.EntityProperty = () => EntityPropertyDecorator();
exports.ArrayProperty = (type) => ArrayPropertyDecorator(type);
exports.normalize = (data, target) => normalizr.normalize(data, define(target));
exports.denormalize = (input, target, entities) => normalizr.denormalize(input, define(target), entities);
const EntityClassDecorator = (params) => {
    const { key, options } = params;
    return function (target) {
        const metadataValue = {
            schema: new normalizr.schema.Entity(key, {}, options),
            type: target
        };
        Reflect.defineMetadata(exports.REFLECT_METADATA_SCHEMA, metadataValue, target);
        return target;
    };
};
const EntityPropertyDecorator = () => {
    return function (target, propertyKey) {
        const properties = (Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, target.constructor) || []).concat(propertyKey);
        const propertyType = Reflect.getMetadata('design:type', target, propertyKey);
        const { schema } = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA, propertyType);
        Reflect.defineMetadata(exports.REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, properties, target.constructor);
        Reflect.defineMetadata(exports.REFLECT_METADATA_SCHEMA, { schema, type: propertyType }, target.constructor, propertyKey);
    };
};
const ArrayPropertyDecorator = (type) => {
    return function (target, propertyKey) {
        const properties = (Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, target.constructor) || []).concat(propertyKey);
        const { schema } = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA, type);
        Reflect.defineMetadata(exports.REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, properties, target.constructor);
        Reflect.defineMetadata(exports.REFLECT_METADATA_SCHEMA, { schema, type: type }, target.constructor, propertyKey);
    };
};
const defineEntityProperties = (parentSchema, target, propertyKey) => {
    const { schema, type } = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA, target, propertyKey);
    parentSchema.define({
        [propertyKey]: schema
    });
    define(type);
};
const defineArrayProperties = (parentSchema, target, propertyKey) => {
    const { schema, type } = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA, target, propertyKey);
    parentSchema.define({
        [propertyKey]: new normalizr.schema.Array(schema)
    });
    define(type);
};
const define = (target) => {
    const { schema } = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA, target);
    (Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, target) || [])
        .forEach(propertyKey => defineEntityProperties(schema, target, propertyKey));
    (Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, target) || [])
        .forEach(propertyKey => defineArrayProperties(schema, target, propertyKey));
    return schema;
};
//# sourceMappingURL=index.js.map