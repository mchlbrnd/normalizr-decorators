import * as normalizr from 'normalizr';
import 'reflect-metadata';
export declare const REFLECT_METADATA_SCHEMA: string;
export declare const REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES: string;
export declare const REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES: string;
export interface EntitySignature {
    key: string;
    options?: normalizr.schema.EntityOptions;
}
export declare type Entity = (params: EntitySignature) => ClassDecorator;
export declare const Entity: Entity;
export declare type EntityProperty = () => PropertyDecorator;
export declare const EntityProperty: EntityProperty;
export declare type ArrayProperty = (elementTarget: any) => PropertyDecorator;
export declare const ArrayProperty: ArrayProperty;
export declare const normalize: any;
export declare const denormalize: any;
