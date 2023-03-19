/* eslint-disable camelcase */
'use strict'

const { slugify } = require('../../framework')

/** @param {Record<string, import('sp-core/Col').Col>} cols */
const updateCols = cols => {
   cols['tags'].data_type = 'm2m'
   cols['tags'].m2m = {
      table: 'tag',
      connecting_table: 'city___tag',
      title_column: 'title',
   }

   cols['img'].data_type = 'file'

   cols['attributes'].data_type = 'key-value'
   cols['attributes'].keyValue = {
      keys_schema_name: 'country',
      keys_table_name: 'attribute',
   }
}



function beforeSave(record) {
   if (record.title.length < 3) throw new Error('Title is very short');
   record.code = slugify(record.title);
}

/** @param {import('../../sp-core/types').ITableApi} model */
function createModel(model) {
   /** @type {import('../../sp-core/types').ITableApi} */
   const obj = {
      ...model,
      async update({ id, bean }) {
         beforeSave(bean);
         return await model.update({ id, bean })
      },
      async insert(bean) {
         beforeSave(bean);
         return await model.insert(bean)
      }
   }
   return Object.freeze(obj)
}

module.exports = { updateCols, createModel }
