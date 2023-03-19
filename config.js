'use strict'

const API_PREFIX = '/api/smart-panel'

const config = {
   DB_SCHEMAS: ['public', 'country', 'secret'],
   DB_SETTINGS: {
      database: 'smart',
      user: 'postgres',
      password: 'root',
      host: '127.0.0.1',
      port: 5432
   },
   SESSION_TABLE: 'secret.session',
   SESSION_DURATION: 1000 * 60,
   PORT: 3000,
   API_PREFIX,
   PUBLIC_DIR: __dirname + '/public',
   // SP_NAME: 'smart-panel',
   // PROJECT_ROOT: __dirname,
   // UPLOADS_SETTINGS_TABLE: 'country.uploads',
   // UPLOADS_URL: API_PREFIX + '/upload',
   // UPLOADS_SUFFIX: 'uploads',
   // FK_TITLE_COLUMN: 'title',
}

module.exports = { config }
