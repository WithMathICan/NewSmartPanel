/* eslint-disable camelcase */
'use strict'

const fs = require('node:fs')
const gm = require('gm').subClass({ imageMagick: true });

// function clearBeanFields(cols, bean) {
//    for (const key in bean) if (!(key in cols)) delete bean[key]
// }

/**
 * @param {string[]} colsKeys
 * @param {string[]} fields
 */
function findNames(colsKeys, fields) {
   // console.log({ colsKeys });
   const names = fields.filter(el => colsKeys.includes(el))
   if (names.length === 0) return '*'
   else return names.join(',')
}

/**
 * @param {import("./types").DbRecord} record
 * @param {string} tableName
 * @param {string[]} colsKeys
 * @param {import('pg').PoolClient} pgClient
 */
async function insertQuery(record, tableName, colsKeys, pgClient) {
   const fields = []
   const nums = []
   const args = []
   let i = 1
   for (const key in record) if (colsKeys.includes(key)) {
      fields.push(key)
      nums.push(`$${i++}`)
      args.push(record[key])
   }
   if (fields.length === 0) throw new Error('Нет ни одного поля для сохранения')
   const sql = `INSERT INTO ${tableName} (${fields.join(',')}) VALUES (${nums.join(',')}) RETURNING *`
   const { rows } = await pgClient.query(sql, args)
   return rows[0]
}

/**
 * @param {string} id
 * @param {import("./types").DbRecord} record
 * @param {string} tableName
 * @param {string[]} colsKeys
 * @param {import('pg').PoolClient} pgClient
 */
async function updateQuery(id, record, tableName, colsKeys, pgClient) {
   const delta = []
   let i = 1
   const args = []
   for (const key in record) if (colsKeys.includes(key)) {
      delta.push(`${key}=$${i++}`)
      args.push(record[key])
   }
   if (delta.length === 0) throw new Error('Нет ни одного поля для сохранения')
   const sql = `UPDATE ${tableName} SET ${delta.join(',')} WHERE id=$${i} RETURNING *`
   args.push(id)
   const { rows } = await pgClient.query(sql, args)
   return rows[0]
}


/**
 * @param {string} bean_id
 * @param {string[]} m2m_id_arr
 * @param {string} bean_field
 * @param {string} m2m_filed
 * @param {string} connectingTable
 * @param {import('pg').PoolClient} pgClient
 */
async function insertM2M(bean_id, m2m_id_arr, bean_field, m2m_filed, connectingTable, pgClient) {
   const insertedValues = []
   for (const id of m2m_id_arr) {
      const { rows } = await pgClient.query(`SELECT * from ${connectingTable} where ${bean_field}=$1 and ${m2m_filed}=$2`, [bean_id, id])
      if (rows.length === 0) {
         if (await pgClient.query(`INSERT INTO ${connectingTable} (${bean_field}, ${m2m_filed}) VALUES ($1, $2)`, [bean_id, id])) {
            insertedValues.push(id)
         } else throw new Error('ошибка при добавлении элемента в базу данных')
      } else insertedValues.push(id)
   }
   return insertedValues
}

/**
 * @param {string} bean_id
 * @param {string[]} insertedValues
 * @param {string} bean_field
 * @param {string} m2m_filed
 * @param {string} connectingTable
 * @param {import('pg').PoolClient} pgClient
 */
async function removeUnusedM2M(bean_id, insertedValues, bean_field, m2m_filed, connectingTable, pgClient) {
   const { rows } = await pgClient.query(`SELECT * from ${connectingTable} where ${bean_field}=$1`, [bean_id])
   const sql = `DELETE FROM ${connectingTable} where ${bean_field}=$1 and ${m2m_filed}=$2`
   for (const id of rows.map(el => el[m2m_filed])) {
      if (!insertedValues.includes(id)) await pgClient.query(sql, [bean_id, id])
   }
}

/**
 * @param {string} schema
 * @param {string} table
 * @param {import("pg").PoolClient} pgClient
 * @param {string} PUBLIC_DIR
 */
function createSpModel(schema, table, pgClient, PUBLIC_DIR) {
   const tableName = `${schema}.${table}`
   const colsDict = require(`../domain/cols/${schema}/${table}.json`)

   /** @type {import('./types').ITableApi} */
   const obj = {
      async cols() {
         return { message: '', result: Object.values(colsDict), statusCode: 200 }
      },
      async bean({ id, fields = [] }) {
         const names = findNames(Object.keys(colsDict), fields)
         const { rows } = await pgClient.query(`SELECT ${names} from ${tableName} where id=$1`, [id])
         if (rows.length > 0) return { message: 'OK', result: rows[0], statusCode: 200 }
         else return { message: 'Запись в базе данных не найдена', statusCode: 404, result: null }
      },
      async beans({ fields = [] }) {
         const names = findNames(Object.keys(colsDict), fields)
         const { rows } = await pgClient.query(`SELECT ${names} from ${tableName} order by id desc`, [])
         return { message: '', result: rows, statusCode: 200 }
      },
      async insert(record) {
         let result = await insertQuery(record, tableName, Object.keys(colsDict), pgClient)
         if (result && result.id) for (const col of Object.values(colsDict)) {
            if (col.m2m) {
               const insertedM2MValues = await insertM2M(result.id, result[col.column_name], `${col.table_name}_id`,
                  `${col.m2m.table}_id`, `${col.table_schema}.${col.m2m.connecting_table}`, pgClient)
               result = await updateQuery(result.id, { [col.column_name]: insertedM2MValues }, tableName, Object.keys(colsDict), pgClient)
            }
         }
         if (result) return { message: 'OK', result, statusCode: 200 }
         else return { message: 'Ошибка при сохранении зиписи', statusCode: 404, result }
      },
      async update({ id, bean }) {
         for (const col of Object.values(colsDict)) {
            if (col.m2m) {
               const insertedM2MValues = await insertM2M(id, bean[col.column_name], `${col.table_name}_id`,
                  `${col.m2m.table}_id`, `${col.table_schema}.${col.m2m.connecting_table}`, pgClient)
               bean[col.column_name] = insertedM2MValues
               await removeUnusedM2M(id, bean[col.column_name], `${col.table_name}_id`,
                  `${col.m2m.table}_id`, `${col.table_schema}.${col.m2m.connecting_table}`, pgClient)
            }
         }
         const result = await updateQuery(id, bean, tableName, Object.keys(colsDict), pgClient)
         if (result) return { message: 'OK', result, statusCode: 200 }
         else return { message: 'Ошибка при сохранении зиписи', statusCode: 404, result }
      },
      async removeMany({ ids }) {
         const numbers = ids.map((/** @type {any} */ _, /** @type {number} */ i) => `$${i + 1}`);
         const sql = `DELETE FROM ${tableName} WHERE id in (${numbers.join(',')}) returning id`
         const { rows } = await pgClient.query(sql, ids)
         if (rows.length !== ids.length) throw new Error('Удаление не успешно')
         return { message: 'OK', result: rows.map(el => el.id), statusCode: 200 }
      },
      async upload(args) {
         const indexOfComma = args.base64.indexOf(',');
         const b64 = args.base64.substring(indexOfComma + 1)
         // console.log(args);
         const sql = 'SELECT * from country.uploads where schema_name=$1 and table_name=$2'
         const { rows } = await pgClient.query(sql, [schema, table])
         /** @type {import('domain/Country').ICountryImgSettings} */
         const data = rows[0]
         if (!data) throw new Error('Для данной таблицы не заданны параметры загрузки файлов')
         const fileName = PUBLIC_DIR + `/${data.files_dir}/${args.fileName}`
         await fs.promises.writeFile(fileName, b64, 'base64')
         await (() => new Promise((resolve, reject) => {
            gm(fileName).resize(data.img_size).quality(data.quality).write(fileName, err => {
               if (err) reject(err)
               resolve(true)
            })
         }))()
         return { message: 'OK', result: `/${data.files_dir}/${args.fileName}`, statusCode: 200 }
      }
   }

   return Object.freeze(obj)
}

module.exports = { createSpModel }
