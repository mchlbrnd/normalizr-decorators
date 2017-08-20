import * as normalizr from 'normalizr';
import 'reflect-metadata';

export const REFLECT_METADATA_SCHEMA: string = 'normalizr.schema';
export const REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES: string = 'normalizr.entity.properties';
export const REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES: string = 'normalizr.array.properties';
export const REFLECT_METADATA_SCHEMA_UNION_PROPERTIES: string = 'normalizr.union.properties';

export type SchemaAttribute = string | normalizr.schema.SchemaFunction;

interface SchemaTarget {
  schema: normalizr.Schema;
  target: any;
}

interface SchemaUnionTarget extends SchemaTarget {
  schemaAttribute: SchemaAttribute;
}

export interface EntityParams {
  key: string;
  options?: normalizr.schema.EntityOptions;
}

export interface UnionParams {
  [name: string]: any;
  schemaAttribute: SchemaAttribute;
}

export type EntityClassDecorator = (params: EntityParams) => ClassDecorator;
export type EntityPropertyDecorator = () => PropertyDecorator;
export type ArrayPropertyDecorator = (elementTarget: any) => PropertyDecorator;
export type UnionPropertyDecorator = (params: UnionParams) => PropertyDecorator;

export type DefineTargetSignature = (target: any) => normalizr.Schema;
export type DefineEntityTargetPropertySignature = (parentSchema: any, parentTarget: any, propertyKey: string | symbol) => void;
export type DefineArrayTargetPropertySignature = (parentSchema: any, parentTarget: any, propertyKey: string | symbol) => void;
export type DefineUnionTargetPropertySignature = (parentSchema: any, parentTarget: any, propertyKey: string | symbol, schemaAttribute: SchemaAttribute) => void;

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

const unionPropertyDecorator: UnionPropertyDecorator = ({schemaAttribute, ...definitionTargets}: UnionParams) => {
  return (target: any, propertyKey: string | symbol): void => {
    const properties: (string | symbol)[] = (Reflect.getMetadata(REFLECT_METADATA_SCHEMA_UNION_PROPERTIES, target.constructor) || []).concat(propertyKey);
    const definition: any = Object
      .keys(definitionTargets)
      .reduce((_definition, definitionTargetKey) => {
        // TODO: SchemaTarget needs refactoring to DefinitionTarget which
        const {schema}: SchemaTarget = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, definitionTargets[definitionTargetKey]);
        return Object.assign(_definition, {[definitionTargetKey]: schema});
      }, {});
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA_UNION_PROPERTIES, properties, target.constructor);
    // FIXME: schema is added to metadataValue to support backwards compatibility
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, {schema: definition, definition, target, schemaAttribute}, target.constructor, propertyKey);
  };
};

export const define: DefineTargetSignature = (schemaTarget: any | [any]): normalizr.Schema => {
  const isArray: boolean = schemaTarget instanceof Array;
  const unwrapped: any = isArray ? schemaTarget[0] : schemaTarget;
  const {schema, schemaAttribute}: SchemaUnionTarget & SchemaTarget = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, unwrapped) || {};

  const entityProperties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, unwrapped) || [];
  entityProperties.forEach((propertyKey: string | symbol) => defineEntityProperties(schema, unwrapped, propertyKey));

  const arrayProperties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, unwrapped) || [];
  arrayProperties.forEach((propertyKey: string | symbol) => defineArrayProperties(schema, unwrapped, propertyKey));

  const unionProperties: (string | symbol)[] = Reflect.getMetadata(REFLECT_METADATA_SCHEMA_UNION_PROPERTIES, unwrapped) || [];
  unionProperties.forEach((propertyKey: string | symbol) => defineUnionProperties(schema, unwrapped, propertyKey, schemaAttribute));

  return isArray ? new normalizr.schema.Array(schema) : schema;
};

const defineEntityProperties: DefineEntityTargetPropertySignature =
  (parentSchema: any, parentTarget: any, propertyKey: string | symbol): void => {
    const {schema, target} = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, parentTarget, propertyKey);
    parentSchema.define({[propertyKey]: schema});
    define(target);
};

const defineArrayProperties: DefineArrayTargetPropertySignature =
  (parentSchema: any, parentTarget: any, propertyKey: string | symbol): void => {
    let {schema, target} = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, parentTarget, propertyKey);
    parentSchema.define({[propertyKey]: [schema]});
    define(target);
};

const defineUnionProperties: DefineUnionTargetPropertySignature =
  (parentSchema: any, parentTarget: any, propertyKey: string | symbol): void => {
    let {schema, target, schemaAttribute} = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, parentTarget, propertyKey);
    parentSchema.define({[propertyKey]: new normalizr.schema.Union(schema, schemaAttribute)});
    define(target);
};

export function Entity(params: EntityParams): ClassDecorator {
  return entityClassDecorator(params);
}
export function EntityProperty(): PropertyDecorator {
  return entityPropertyDecorator();
}
export function ArrayProperty(elementTarget: any): PropertyDecorator {
  return arrayPropertyDecorator(elementTarget);
}
export function UnionProperty(params: UnionParams): PropertyDecorator {
  return unionPropertyDecorator(params);
}

export function normalize(data: any, target: any): {entities: any, result: any} {
  return normalizr.normalize(data, define(target));
}
export function denormalize(input: any, target: any, entities: any): any {
  return normalizr.denormalize(input, define(target), entities);
}
