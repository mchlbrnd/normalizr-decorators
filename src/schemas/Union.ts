import 'reflect-metadata';
import { REFLECT_METADATA_SCHEMA, REFLECT_METADATA_SCHEMA_UNION_PROPERTIES, SchemaAttribute, SchemaTargetSignature } from '../utils/index';

export interface UnionParams {
  [name: string]: any;
  schemaAttribute: SchemaAttribute;
}

export type UnionPropertyDecorator = (params: UnionParams) => PropertyDecorator;

const unionPropertyDecorator: UnionPropertyDecorator = ({schemaAttribute, ...definitionTargets}: UnionParams) => {
  return (target: any, propertyKey: string | symbol): void => {
    const properties: (string | symbol)[] =
      (Reflect.getMetadata(REFLECT_METADATA_SCHEMA_UNION_PROPERTIES, target.constructor) || []).concat(propertyKey);
    const definition: any = Object
      .keys(definitionTargets)
      .reduce((_definition, definitionTargetKey) => {
        const {schema}: SchemaTargetSignature = Reflect.getMetadata(REFLECT_METADATA_SCHEMA, definitionTargets[definitionTargetKey]);
        return Object.assign(_definition, {[definitionTargetKey]: schema});
      }, {});

    // FIXME: schema is added to metadataValue to support backwards compatibility
    const metadataValue = {schema: definition, definition, target, schemaAttribute};
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA_UNION_PROPERTIES, properties, target.constructor);
    Reflect.defineMetadata(REFLECT_METADATA_SCHEMA, metadataValue, target.constructor, propertyKey);
  };
};

export function UnionProperty(params: UnionParams): PropertyDecorator {
  return unionPropertyDecorator(params);
}
