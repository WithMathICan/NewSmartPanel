export interface ISecretPermission {
   id?: string
   table_schema: string
   table_name: string
   permission_value: string
}

export interface ISecretPermissionValue {
   id?: string
   alias: string
   title: string
}

export interface ISecretGroup {
   id?: string
   title: string
   permissions: number
}

export interface ISecretUser {
   id?: string
   title: string
   password: string
   groups: number
}

export interface ISecretSession {
   id?: string
   session_id: string
   ip_address: string
   data: Record<string, any>
   created_at: Date
   updated_at: Date
   expires: number
}

