/* eslint-disable camelcase */
'use strict'

/** @param {Record<string, import('sp-core/Col').Col>} cols */
const updateCols = cols => {
   cols['permissions'].data_type = 'm2m'
   cols['permissions'].m2m = {
      table: 'permission',
      connecting_table: 'permission___group',
      title_column: ['table_schema', 'table_name', 'permission_value'],
      isTree: true,
   }
}

module.exports = { updateCols }
