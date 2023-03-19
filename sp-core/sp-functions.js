/* eslint-disable camelcase */
'use strict'

const fs = require('node:fs')
const path = require('node:path')
const { Col } = require('./Col');

const MY_SQL_COLS = `SELECT * from information_schema.columns 
where table_catalog = $1 and table_schema = $2 and table_name = $3`;

// const MY_SQL_FK_SAME_SCHEMA = `SELECT
// tc.table_schema,
// tc.constraint_name,
// tc.table_name,
// kcu.column_name,
// ccu.table_schema AS foreign_table_schema,
// ccu.table_name AS foreign_table_name,
// ccu.column_name AS foreign_column_name
// FROM
// information_schema.table_constraints AS tc
// JOIN information_schema.key_column_usage AS kcu
// ON tc.constraint_name = kcu.constraint_name
// AND tc.table_schema = kcu.table_schema
// JOIN information_schema.constraint_column_usage AS ccu
// ON ccu.constraint_name = tc.constraint_name
// AND ccu.table_schema = tc.table_schema
// WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema=$1 AND tc.table_name=$2`

const MY_SQL_FK = `SELECT
tc.table_schema, 
tc.constraint_name, 
tc.table_name, 
kcu.column_name, 
ccu.table_schema AS foreign_table_schema,
ccu.table_name AS foreign_table_name,
ccu.column_name AS foreign_column_name 
FROM 
information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
ON tc.constraint_name = kcu.constraint_name
AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema=$1 AND tc.table_name=$2`

/**
 * @param {string} schema
 * @param {string} table
 * @param {string} database
 * @param {import('./types').FQuery} query
 * @returns
 */
async function findColumns(schema, table, database, query) {
   const dbCols = await query(MY_SQL_COLS, [database, schema, table])
   /** @type {import('./Col').Col[]} */
   const cols = dbCols.rows.map(el => new Col(el))
   return cols
}

/**
 * @param {import('./Col').Col[]} cols
 * @param {import('./Col').IDbFk[]} dbForeignKeys
 * @param {string} fk_title_name
 */
function updateColumns(cols, dbForeignKeys, fk_title_name) {
   for (const fk of dbForeignKeys) for (const col of cols) {
      if (col.column_name === fk.column_name) {
         col.data_type = 'fk'
         const { foreign_table_name, foreign_table_schema, foreign_column_name } = fk
         col.fk = { foreign_column_name, foreign_table_name, foreign_table_schema, foreign_title_column_name: fk_title_name }
      }
   }
}

/**
* @param {string} schema
* @param {string} table
* @param {string} database
* @param {import('./types').FQuery} query
* @param {string} fk_title_name
* @returns {Promise<Record<string, Col>>}
*/
async function createCols(schema, table, database, query, fk_title_name) {
   const cols = await findColumns(schema, table, database, query)
   const { rows } = await query(MY_SQL_FK, [schema, table])
   updateColumns(cols, rows, fk_title_name)
   /** @type {Record<string, Col>} */
   const result = {}
   for (const col of cols) result[col.column_name] = col
   return result
}

/**
* @param {string[]} schemas
* @param {import('./types').FQuery} query
* @returns {Promise<Record<string, string[]>>}
*/
async function findDbTables(schemas, query) {
   /** @type {Record<string, string[]>} */
   const dbTables = {};
   for (const schema of schemas) {
      const sql = 'SELECT table_name FROM information_schema.tables WHERE table_schema = $1'
      const { rows } = await query(sql, [schema])
      if (rows.length > 0) {
         dbTables[schema] = rows.map(el => el.table_name)
         dbTables[schema] = dbTables[schema].filter(el => !el.includes('___'))
      }
   }
   return dbTables
}

/**
 * @param {Record<string, string[]>} dbTables
 * @param {string} domainDir
 * @param {string} modelsDir
 * @param {string} PG_DATABASE
 * @param {import("./types").FQuery} query
 */
async function saveAllColumnsToFiles(dbTables, domainDir, modelsDir, PG_DATABASE, query) {
   for (const schema in dbTables) for (const table of dbTables[schema]) {
      const cols = await createCols(schema, table, PG_DATABASE, query, 'title')
      const definitionFile = path.join(modelsDir, schema, table + '.js')
      try {
         const defs = require(definitionFile)
         if (defs.updateCols) defs.updateCols(cols)
      } catch (e) { /** */ }
      const fileName = path.join(domainDir, 'cols', schema, table + '.json')
      delete cols.id
      await fs.promises.writeFile(fileName, JSON.stringify(cols, null, 2))
   }
}

module.exports = { createCols, findDbTables, findColumns, saveAllColumnsToFiles }
