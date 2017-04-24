import * as normalizr from 'normalizr';
import 'reflect-metadata';

export const REFLECT_METADATA_SCHEMA = 'normalizr.schema';
export const REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES = 'normalizr.entity.properties';
export const REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES = 'normalizr.array.properties';

export interface EntitySignature {
  key: string
  options?: normalizr.schema.EntityOptions
}

export const Entity = (params: EntitySignature): ClassDecorator =>
  EntityClassDecorator(params);

export const EntityProperty = (): PropertyDecorator =>
  EntityPropertyDecorator();

export const ArrayProperty = (type: Function): PropertyDecorator =>
  ArrayPropertyDecorator(type);

export const normalize = (data: any, target: any): {entities: any, result: any} =>
  normalizr.normalize(data, define(target));

export const denormalize = (input: any, target: any, entities: any): any =>
  normalizr.denormalize(input, define(target), entities);

const EntityClassDecorator = (params: EntitySignature): ClassDecorator => {
  const {key, options} = params;
  return function (target: any) {
    const metadataValue = {
      schema: new normalizr.schema.Entity(key, {}, options),
      type: target
    };
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, metadataValue, target);
    return target;
  };
};

const EntityPropertyDecorator = (): PropertyDecorator => {
  return function (target: any, propertyKey: string | symbol): void {
    const properties = (Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, target.constructor) || []).concat(propertyKey);
    const propertyType = Reflect.getMetadata('design:type', target, propertyKey);
    const {schema} = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, propertyType);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, properties, target.constructor);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, {schema, type: propertyType}, target.constructor, propertyKey);
  };
};

const ArrayPropertyDecorator = (type: any) => {
  return function (target: any, propertyKey: string | symbol): void {
    const properties = (Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, target.constructor) || []).concat(propertyKey);
    const {schema} = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, type);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, properties, target.constructor);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, {schema, type: type}, target.constructor, propertyKey);
  };
};

const defineEntityProperties = (parentSchema: any, target: any, propertyKey: string | symbol): void => {
  const {schema, type} = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, target, propertyKey);
  parentSchema.define({
    [propertyKey]: schema
  });
  define(type);
};

const defineArrayProperties = (parentSchema: any, target: any, propertyKey: string | symbol): void => {
  const {schema, type} = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, target, propertyKey);
  parentSchema.define({
    [propertyKey]: new normalizr.schema.Array(schema)
  });
  define(type);
};

const define = (target: any): normalizr.Schema => {
  const {schema} = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, target);

  (Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, target) || [])
    .forEach(propertyKey => defineEntityProperties(schema, target, propertyKey));

  (Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, target) || [])
    .forEach(propertyKey => defineArrayProperties(schema, target, propertyKey));

  return schema;
};
