'use strict'

/**
 * @param {import("./types").FQuery} query
 * @param {string} tableName
 * @returns {import('./types').IQbuilder}
 */
const createQBuilder = (query, tableName) => ({
   tableName,
   async queryAll(sql, arr) {
      const { rows } = await query(sql, arr)
      return rows
   },
   async queryFirst(sql, arr) {
      const { rows } = await query(sql, arr)
      return rows[0]
   },
   async findById(id) {
      return await this.queryFirst(`SELECT * FROM ${tableName} WHERE id=$1`, [id])
   },
   async findAll() {
      return await this.queryAll(`SELECT * FROM ${tableName}`, [])
   },
   async insert(record) {
      const fields = []
      const nums = []
      const args = []
      let i = 1
      for (const key in record) if (key !== 'id') {
         fields.push(key)
         nums.push(`$${i++}`)
         args.push(record[key])
      }
      if (fields.length === 0) throw new Error('Нет ни одного поля для сохранения')
      const sql = `INSERT INTO ${tableName} (${fields.join(',')}) VALUES (${nums.join(',')}) RETURNING *`
      const { rows } = await query(sql, args)
      return rows[0]
   },
   async update(id, record) {
      const delta = []
      let i = 1
      const args = []
      for (const key in record) if (key !== 'id') {
         delta.push(`${key}=$${i++}`)
         args.push(record[key])
      }
      if (delta.length === 0) throw new Error('Нет ни одного поля для сохранения')
      const sql = `UPDATE ${tableName} SET ${delta.join(',')} WHERE id=$${i} RETURNING *`
      args.push(id)
      const { rows } = await query(sql, args)
      return rows[0]
   },
   async removeMany(ids) {
      const nums = ids.map((/** @type {any} */ _, /** @type {number} */ i) => `$${i + 1}`);
      const sql = `DELETE FROM ${tableName} WHERE id in (${nums.join(',')}) returning id`
      const { rows } = await query(sql, ids)
      return rows.map(el => el.id)
   },
   async removeOne(id) {
      const ids = this.removeMany([id])
      return ids[0]
   }
})

module.exports = { createQBuilder }
