/* eslint-disable camelcase */
'use strict'

const findPermissionKey = p => `${p.table_schema}--${p.table_name}--${p.permission_value}`

async function findExistingPermissions(permission_table, query) {
   const { rows } = await query(`SELECT * FROM ${permission_table}`)
   const permissions = {}
   for (const p of rows) {
      permissions[findPermissionKey(p)] = p
   }
   return permissions
}

function findPermissionsToAdd(existingPermissions, dbTables, values) {
   const permissionsToAdd = {}
   for (const schema in dbTables) for (const table of dbTables[schema]) {
      for (const val of values) {
         const newPermission = {
            table_schema: schema,
            table_name: table,
            permission_value: val,
         }
         const permissionKey = findPermissionKey(newPermission)
         if (!(permissionKey in existingPermissions)) permissionsToAdd[permissionKey] = newPermission;
      }
   }
   return permissionsToAdd
}

async function findPermissionValues(permission_value_table, query) {
   const { rows } = await query(`SELECT * FROM ${permission_value_table}`)
   return rows.map(el => el.alias)
}

async function createPermissions(permission_value_table, permission_table, dbTables, query) {
   const values = await findPermissionValues(permission_value_table, query)
   const existingPermissions = await findExistingPermissions(permission_table, query)
   const permissionsToAdd = findPermissionsToAdd(existingPermissions, dbTables, values)
   for (const key in permissionsToAdd) {
      const sql = `INSERT INTO ${permission_table} (table_schema, table_name, permission_value) VALUES ($1, $2, $3)`
      const { table_schema, table_name, permission_value } = permissionsToAdd[key]
      await query(sql, [table_schema, table_name, permission_value])
   }
}

module.exports = { createPermissions }
