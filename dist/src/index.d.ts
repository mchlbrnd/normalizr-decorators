import * as normalizr from 'normalizr';
import 'reflect-metadata';
export declare const REFLECT_METADATA_SCHEMA: string;
export declare const REFLECT_METADATA_SCHEMA_ENTITY_PROPERTIES: string;
export declare const REFLECT_METADATA_SCHEMA_ARRAY_PROPERTIES: string;
export interface EntityParams {
    key: string;
    options?: normalizr.schema.EntityOptions;
}
export declare type EntityClassDecorator = (params: EntityParams) => ClassDecorator;
export declare type EntityPropertyDecorator = () => PropertyDecorator;
export declare type ArrayPropertyDecorator = (elementTarget: any) => PropertyDecorator;
export declare type NormalizeSignature = (data: any, target: any) => {
    entities: any;
    result: any;
};
export declare type DenormalizeSignature = (input: any, target: any, entities: any) => any;
export declare const Entity: EntityClassDecorator;
export declare const EntityProperty: EntityPropertyDecorator;
export declare const ArrayProperty: ArrayPropertyDecorator;
export declare const normalize: NormalizeSignature;
export declare const denormalize: DenormalizeSignature;
