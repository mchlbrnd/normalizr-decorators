import 'reflect-metadata';
import { denormalize as $denormalize, normalize as $normalize, schema, Schema } from 'normalizr';
import SchemaFunction = schema.SchemaFunction;
import $Array = schema.Array;
import Union = schema.Union;

export const REFLECT_METADATA_SCHEMA: string = 'normalizr.schema';
export const REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES: string = 'normalizr.entity.properties';
export const REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES: string = 'normalizr.array.properties';
export const REFLECT_METADATA_SCHEMA_UNION_PROPERTIES: string = 'normalizr.union.properties';

export type SchemaAttribute = string | SchemaFunction;
export type DefineTargetSignature = (target: any) => Schema;
export type DefineTargetPropertySignature = (parentSchema: any, parentTarget: any, propertyKey: string | symbol) => void;
export type DefineAttributeTargetPropertySignature =
  (parentSchema: any, parentTarget: any, propertyKey: string | symbol, schemaAttribute: SchemaAttribute) => void;
export type NormalizeResult = {entities: any, result: any};
export type NormalizeParamsSignature = {data: any, target: any};
export type NormalizeSignature = (params: NormalizeParamsSignature) => NormalizeResult;
export type DenormalizeParamsSignature = {input: any, target: any, entities: any};
export type DenormalizeSignature = (params: DenormalizeParamsSignature) => any;

export interface SchemaTargetSignature {
  schema: Schema;
  target: any;
}

interface SchemaAttributeTargetSignature extends SchemaTargetSignature {
  schemaAttribute: SchemaAttribute;
}

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

const defineUnionProperties: DefineAttributeTargetPropertySignature =
  (parentSchema: any, parentTarget: any, propertyKey: string | symbol): void => {
    let {schema, target, schemaAttribute} = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, parentTarget, propertyKey);
    parentSchema.define({[propertyKey]: new Union(schema, schemaAttribute)});
    define(target);
  };

const define: DefineTargetSignature = (schemaTarget: any | any[]): Schema => {
  const isArray: boolean = schemaTarget instanceof Array;
  const unwrapped: any = isArray ? schemaTarget[0] : schemaTarget;
  const {schema, schemaAttribute}: SchemaAttributeTargetSignature & SchemaTargetSignature =
    Reflect.getMetadata(REFLECT_METADATA_SCHEMA, unwrapped) || {};

  const entityProperties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, unwrapped) || [];
  entityProperties.forEach((propertyKey: string | symbol) => defineEntityProperties(schema, unwrapped, propertyKey));

  const arrayProperties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, unwrapped) || [];
  arrayProperties.forEach((propertyKey: string | symbol) => defineArrayProperties(schema, unwrapped, propertyKey));

  const unionProperties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_UNION_PROPERTIES, unwrapped) || [];
  unionProperties.forEach((propertyKey: string | symbol) => defineUnionProperties(schema, unwrapped, propertyKey, schemaAttribute));

  return isArray ? new $Array(schema) : schema;
};

export const normalize: NormalizeSignature =
  ({data, target}: NormalizeParamsSignature): NormalizeResult => $normalize(data, define(target));

export const denormalize: DenormalizeSignature =
  ({input, target, entities}: DenormalizeParamsSignature): any => $denormalize(input, define(target), entities);
