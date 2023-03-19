export type TColType = 'number' | 'varchar' | 'date' | 'fk' | 'm2m' | 'id' | 'file' | 'key-value' | 'json';

export interface IDbFk{
   table_schema: string
   constraint_name: string
   table_name: string
   column_name: string
   foreign_table_schema: string
   foreign_table_name: string
   foreign_column_name: string
}

export interface IFk {
   foreign_table_schema: string
   foreign_table_name: string
   foreign_column_name: string
   foreign_title_column_name: string
}

export interface IDbCol{
   table_catalog: string, 
   table_schema: string, 
   table_name: string, 
   column_name: string,
   is_identity: 'YES' | 'NO'
   is_nullable: 'YES' | 'NO'
   data_type: 'bigint' | 'character varying' | 'ARRAY'
   ordinal_position: number
   udt_name: string
   column_default: any
}

export interface IM2M {
   table: string
   title_column: string | string[]
   connecting_table: string
   isTree?: boolean
}

export interface IKeyValue {
   keys_schema_name: string
   keys_table_name: string
}

export class Col{
   table_catalog: string
   table_schema: string
   table_name: string
   column_name: string
   is_primary_key: boolean
   is_nullable: boolean
   ordinal_position: number
   column_default: any
   data_type: TColType
   is_array: boolean
   fk: IFk
   m2m: IM2M
   keyValue: IKeyValue

   constructor(col_data: IDbCol)
}