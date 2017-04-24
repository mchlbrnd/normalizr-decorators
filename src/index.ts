import * as normalizr from 'normalizr';
import 'reflect-metadata';

export const REFLECT_METADATA_SCHEMA: string = 'normalizr.schema';
export const REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES: string = 'normalizr.entity.properties';
export const REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES: string = 'normalizr.array.properties';

type EntityClassDecorator = (params: EntitySignature) => ClassDecorator;
type EntityTarget = {schema: normalizr.Schema, target: any};

const EntityClassDecorator: EntityClassDecorator = (params: EntitySignature): ClassDecorator => {
  const {key, options} = params;
  return (target: any) => {
    const schema: normalizr.Schema = new normalizr.schema.Entity(key, {}, options);
    const metadataValue: EntityTarget = {schema, target};
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, metadataValue, target);
    return target;
  };
};

type EntityPropertyDecorator = () => PropertyDecorator;
const EntityPropertyDecorator: EntityPropertyDecorator = (): PropertyDecorator => {
  return (target: any, propertyKey: string | symbol): void => {
    const properties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, target.constructor) || [];
    properties.push(propertyKey);
    const propertyTarget: any = Reflect.getMetadata('design:type', target, propertyKey);
    const {schema}: EntityTarget = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, propertyTarget);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, properties, target.constructor);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, {schema, target: propertyTarget}, target.constructor, propertyKey);
  };
};

type ArrayPropertyDecorator = (elementTarget: any) => (target: any, propertyKey: string | symbol) => void;
const ArrayPropertyDecorator: ArrayPropertyDecorator = (elementTarget: any) => {
  return (target: any, propertyKey: string | symbol): void => {
    const properties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, target.constructor) || [];
    properties.push(propertyKey);
    const {schema}: EntityTarget = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, elementTarget);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, properties, target.constructor);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, {schema, target: elementTarget}, target.constructor, propertyKey);
  };
};

type DefineTargetSignature = (target: any) => normalizr.Schema;
const define: DefineTargetSignature = (target: any): normalizr.Schema => {
  const {schema}: EntityTarget = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, target);

  const entityProperties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, target) || [];
  entityProperties.forEach((propertyKey: string | symbol) => defineEntityProperties(schema, target, propertyKey));

  const arrayProperties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, target) || [];
  arrayProperties.forEach((propertyKey: string | symbol) => defineArrayProperties(schema, target, propertyKey));

  return schema;
};

type DefineTargetPropertySignature = (parentSchema: any, parentTarget: any, propertyKey: string | symbol) => void;

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

export interface EntitySignature {
  key: string;
  options?: normalizr.schema.EntityOptions;
}

export type Entity = (params: EntitySignature) => ClassDecorator;
export const Entity: Entity = (params: EntitySignature): ClassDecorator => EntityClassDecorator(params);

export type EntityProperty = () => PropertyDecorator;
export const EntityProperty: EntityProperty = (): PropertyDecorator => EntityPropertyDecorator();

export type ArrayProperty = (elementTarget: any) => PropertyDecorator;
export const ArrayProperty: ArrayProperty = (elementTarget: any): PropertyDecorator => ArrayPropertyDecorator(elementTarget);

export const normalize: any = (data: any, target: any): {entities: any, result: any} => normalizr.normalize(data, define(target));

export const denormalize: any = (input: any, target: any, entities: any): any => normalizr.denormalize(input, define(target), entities);
