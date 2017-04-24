"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const normalizr = require("normalizr");
require("reflect-metadata");
exports.REFLECT_METADATA_SCHEMA = 'normalizr.schema';
exports.REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES = 'normalizr.entity.properties';
exports.REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES = 'normalizr.array.properties';
const EntityClassDecorator = (params) => {
    const { key, options } = params;
    return (target) => {
        const schema = new normalizr.schema.Entity(key, {}, options);
        const metadataValue = { schema, target };
        Reflect.defineMetadata(exports.REFLECT_METADATA_SCHEMA, metadataValue, target);
        return target;
    };
};
const EntityPropertyDecorator = () => {
    return (target, propertyKey) => {
        const properties = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, target.constructor) || [];
        properties.push(propertyKey);
        const propertyTarget = Reflect.getMetadata('design:type', target, propertyKey);
        const { schema } = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA, propertyTarget);
        Reflect.defineMetadata(exports.REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, properties, target.constructor);
        Reflect.defineMetadata(exports.REFLECT_METADATA_SCHEMA, { schema, target: propertyTarget }, target.constructor, propertyKey);
    };
};
const ArrayPropertyDecorator = (elementTarget) => {
    return (target, propertyKey) => {
        const properties = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, target.constructor) || [];
        properties.push(propertyKey);
        const { schema } = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA, elementTarget);
        Reflect.defineMetadata(exports.REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, properties, target.constructor);
        Reflect.defineMetadata(exports.REFLECT_METADATA_SCHEMA, { schema, target: elementTarget }, target.constructor, propertyKey);
    };
};
const define = (target) => {
    const { schema } = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA, target);
    const entityProperties = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, target) || [];
    entityProperties.forEach((propertyKey) => defineEntityProperties(schema, target, propertyKey));
    const arrayProperties = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, target) || [];
    arrayProperties.forEach((propertyKey) => defineArrayProperties(schema, target, propertyKey));
    return schema;
};
const defineEntityProperties = (parentSchema, parentTarget, propertyKey) => {
    const { schema, target } = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA, parentTarget, propertyKey);
    parentSchema.define({ [propertyKey]: schema });
    define(target);
};
const defineArrayProperties = (parentSchema, parentTarget, propertyKey) => {
    let { schema, target } = Reflect.getMetadata(exports.REFLECT_METADATA_SCHEMA, parentTarget, propertyKey);
    parentSchema.define({ [propertyKey]: [schema] });
    define(target);
};
exports.Entity = (params) => EntityClassDecorator(params);
exports.EntityProperty = () => EntityPropertyDecorator();
exports.ArrayProperty = (elementTarget) => ArrayPropertyDecorator(elementTarget);
exports.normalize = (data, target) => normalizr.normalize(data, define(target));
exports.denormalize = (input, target, entities) => normalizr.denormalize(input, define(target), entities);
//# sourceMappingURL=index.js.map