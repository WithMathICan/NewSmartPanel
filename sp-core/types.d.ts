import {QueryResult} from 'pg'

export type FQuery = (sql: string, arr: any[]) => Promise<QueryResult>
export interface DbRecord{
   [x:string]: any
}

// export interface ISpModel {
//    cols() : Promise<Record<string, Col>>
//    bean(id: string, fields = ['*']): Promise<DbRecord | null>
//    beans(fields = ['*']): Promise<DbRecord[]>
//    insert(record: DbRecord): Promise<DbRecord>
//    update(id: string, record: DbRecord): Promise<DbRecord>
//    removeMany(ids: string[]): Promise<string[]>
// }

export interface IApiResult<T>{
   statusCode: number
   message: string
   result: T
}

export interface IUploadArgs{
   fileName: string
   fileType: string
   lastModified: number
   size: number
   base64: string
}

export interface ITableApi{
   [x: string]: (args: any) => Promise<IApiResult<any>>
   cols: () => Promise<IApiResult<Col[]>>
   bean: (args: {id: string, fields: string[]}) => Promise<IApiResult<DbRecord>>
   beans: (args: {fields: string[]}) => Promise<IApiResult<DbRecord[]>>
   insert: (record: DbRecord) => Promise<IApiResult<DbRecord>>
   update: (args: {id: string, bean: DbRecord}) => Promise<IApiResult<DbRecord>>
   removeMany: (args: {ids: string[]}) => Promise<IApiResult<string[]>>
   upload: (args: IUploadArgs) => Promise<IApiResult<string>>
}

export interface IQbuilder {
   tableName: string
   queryAll(sql: string, arr: any[]) : Promise<any[]> 
   queryFirst(sql: string, arr: any[]) : Promise<any>
   findById(id: string) : Promise<any>,
   findAll() : Promise<any[]>
   insert(record: DbRecord) : Promise<any>
   update(id: string, record: DbRecord) : Promise<any>
   removeMany(ids: string[]) : Promise<string[]>
   removeOne(id: string) : Promise<string>
}

export interface ICookie {
   session_id?: string
}

export interface ISession {

}
