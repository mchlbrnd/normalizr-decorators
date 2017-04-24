import * as normalizr from 'normalizr';
import 'reflect-metadata';

export const REFLECT_METADATA_SCHEMA: string = 'normalizr.schema';
export const REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES: string = 'normalizr.entity.properties';
export const REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES: string = 'normalizr.array.properties';

interface SchemaTarget {
  schema: normalizr.Schema;
  target: any;
}

export interface EntityParams {
  key: string;
  options?: normalizr.schema.EntityOptions;
}

export type EntityClassDecorator = (params: EntityParams) => ClassDecorator;
export type EntityPropertyDecorator = () => PropertyDecorator;
export type ArrayPropertyDecorator = (elementTarget: any) => PropertyDecorator;

type DefineTargetSignature = (target: any) => normalizr.Schema;
type DefineTargetPropertySignature = (parentSchema: any, parentTarget: any, propertyKey: string | symbol) => void;

export type NormalizeSignature = (data: any, target: any) => {entities: any, result: any};
export type DenormalizeSignature = (input: any, target: any, entities: any) => any;

const entityClassDecorator: EntityClassDecorator = (params: EntityParams): ClassDecorator => {
  const {key, options} = params;
  return (target: any) => {
    const schema: normalizr.Schema = new normalizr.schema.Entity(key, {}, options);
    const metadataValue: SchemaTarget = {schema, target};
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, metadataValue, target);
    return target;
  };
};

const entityPropertyDecorator: EntityPropertyDecorator = (): PropertyDecorator => {
  return (target: any, propertyKey: string | symbol): void => {
    const properties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, target.constructor) || [];
    properties.push(propertyKey);
    const propertyTarget: any = Reflect.getMetadata('design:type', target, propertyKey);
    const {schema}: SchemaTarget = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, propertyTarget);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, properties, target.constructor);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, {schema, target: propertyTarget}, target.constructor, propertyKey);
  };
};

const arrayPropertyDecorator: ArrayPropertyDecorator = (elementTarget: any) => {
  return (target: any, propertyKey: string | symbol): void => {
    const properties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, target.constructor) || [];
    properties.push(propertyKey);
    const {schema}: SchemaTarget = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, elementTarget);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, properties, target.constructor);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, {schema, target: elementTarget}, target.constructor, propertyKey);
  };
};

const define: DefineTargetSignature = (target: any): normalizr.Schema => {
  const {schema}: SchemaTarget = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, target);

  const entityProperties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, target) || [];
  entityProperties.forEach((propertyKey: string | symbol) => defineEntityProperties(schema, target, propertyKey));

  const arrayProperties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, target) || [];
  arrayProperties.forEach((propertyKey: string | symbol) => defineArrayProperties(schema, target, propertyKey));

  return schema;
};

const defineEntityProperties: DefineTargetPropertySignature =
  (parentSchema: any, parentTarget: any, propertyKey: string | symbol): void => {
    const {schema, target} = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, parentTarget, propertyKey);
    parentSchema.define({[propertyKey]: schema});
    define(target);
};

const defineArrayProperties: DefineTargetPropertySignature =
  (parentSchema: any, parentTarget: any, propertyKey: string | symbol): void => {
    let {schema, target} = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, parentTarget, propertyKey);
    parentSchema.define({[propertyKey]: [schema]});
    define(target);
};

export const Entity: EntityClassDecorator = (params: EntityParams): ClassDecorator => entityClassDecorator(params);
export const EntityProperty: EntityPropertyDecorator = (): PropertyDecorator => entityPropertyDecorator();
export const ArrayProperty: ArrayPropertyDecorator = (elementTarget: any): PropertyDecorator => arrayPropertyDecorator(elementTarget);

export const normalize: NormalizeSignature = (data: any, target: any): {entities: any, result: any} =>
  normalizr.normalize(data, define(target));

export const denormalize: DenormalizeSignature = (input: any, target: any, entities: any): any =>
  normalizr.denormalize(input, define(target), entities);
