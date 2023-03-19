/* eslint-disable camelcase */
'use strict'

/** @param {Record<string, import('sp-core/Col').Col>} cols */
const updateCols = cols => {
   cols['groups'].data_type = 'm2m'
   cols['groups'].m2m = {
      table: 'group',
      connecting_table: 'user___group',
      title_column: 'title',
      isTree: false,
   }
}

module.exports = { updateCols }
