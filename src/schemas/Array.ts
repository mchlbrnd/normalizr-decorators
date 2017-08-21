import 'reflect-metadata';
import { REFLECT_METADATA_SCHEMA, REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, SchemaTargetSignature } from '../utils/index';

export type ArrayPropertyDecorator = (elementTarget: any) => PropertyDecorator;

const arrayPropertyDecorator: ArrayPropertyDecorator = (propertyTarget: any) => {
  return (target: any, propertyKey: string | symbol): void => {
    const properties: (string | symbol)[] =
      (Reflect.getMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, target.constructor) || []).concat(propertyKey);
    const {schema}: SchemaTargetSignature = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, propertyTarget);
    const metadataValue = {schema, target: propertyTarget};
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES, properties, target.constructor);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, metadataValue, target.constructor, propertyKey);
  };
};

export function ArrayProperty(elementTarget: any): PropertyDecorator {
  return arrayPropertyDecorator(elementTarget);
}
