export interface IServerResponse<T> {
   headers: Record<string, string>
   data: T
   statusCode: number
}
export interface IRouterArgs<TGet> {
   method: string
   url: string
   urlArray: string[]
   getParams: TGet
   postParams?: Record<string, any>
   uploadedFilePath?: string
   cookies?: Record<string, any>
}
interface IUploadGetParams {
   schema: string
   table: string
   fileName: string
   fileType: string
   lastModified: string
   size: string
}
export interface IAploadArgs extends IRouterArgs<IUploadGetParams>{}

export interface IUploadRouter {
   isUrlAccepted: (args: IRouterArgs<>) => boolean
   handler: (tempFile: string, args: IRouterArgs<IUploadGetParams>) => Promise<IServerResponse<{message: string, result: string}>>
   findNameForTemporaryFile: () => string
}

export interface IApiHandler<T> {
   isUrlAccepted(args: IRouterArgs<Record<string, string>>) : boolean
   isPostDataNeeded: boolean
   handler(args: IRouterArgs<Record<string, string>>) : Promise<IServerResponse<{message: srting, result: T}>>
}

export type FUrlHandler<T> = (args: any) => Promise<IServerResponse<T>>
// export type FRouter<T> = (method: string, url: string) => Promise<FUrlHandler<T> | null>
export type FRouter<T> = (args: IRouterArgs) => Promise<IServerResponse<T> | null>



export type FStaticFilesHandler = (url: string) => Promise<IServerResponse<any> | null> 

