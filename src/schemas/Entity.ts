import 'reflect-metadata';
import { schema } from 'normalizr';
import $Entity = schema.Entity;
import EntityOptions = schema.EntityOptions;
import { REFLECT_METADATA_SCHEMA, REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, SchemaTargetSignature } from '../utils/index';

export interface EntityParams {
  key: string;
  options?: EntityOptions;
}

export type EntityClassDecorator = (params: EntityParams) => ClassDecorator;
export type EntityPropertyDecorator = () => PropertyDecorator;

const entityClassDecorator: EntityClassDecorator = ({key, options}: EntityParams): ClassDecorator => {
  return (target: any): any => {
    const metadataValue: SchemaTargetSignature = {schema: new $Entity(key, {}, options), target};
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, metadataValue, target);
    return target;
  };
};

export function Entity(params: EntityParams): ClassDecorator {
  return entityClassDecorator(params);
}

const entityPropertyDecorator: EntityPropertyDecorator = (): PropertyDecorator => {
  return (target: any, propertyKey: string | symbol): void => {
    const properties: (string | symbol)[] =
      (Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, target.constructor) || []).concat(propertyKey);
    const propertyTarget: any = Reflect.getMetadata('design:type', target, propertyKey);
    const {schema}: SchemaTargetSignature = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, propertyTarget);
    const metadataValue = {schema, target: propertyTarget};
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES, properties, target.constructor);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, metadataValue, target.constructor, propertyKey);
  };
};

export function EntityProperty(): PropertyDecorator {
  return entityPropertyDecorator();
}
