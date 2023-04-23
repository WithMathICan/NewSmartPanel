'use strict'

const http = require('node:http')
const assert = require('node:assert')
const { Pool } = require('pg')
const { createStaticServer } = require('./framework/server/static-files-handler')
const { findDbTables, saveAllColumnsToFiles } = require('./sp-core/sp-functions')
const { createInterfaces } = require('./sp-core/create-interfaces')
const { config } = require('./config')
const { createResponse } = require('./framework/server/response')
const { parseCookies, receiveArgs } = require('./framework/server/request')
const { createSpModel } = require('./sp-core/sp-model')
const { kebabToCamelCase } = require('./framework')
const {
   // createSessionStoreInRAM,
   startSession,
   createDbSessionStore
} = require('./framework/server/session')
const { createQBuilder } = require('./sp-core/sp-query-builder')

const PG_DATABASE = config.DB_SETTINGS.database
const staticServer = createStaticServer([__dirname + '/public']);
const pgPool = new Pool(config.DB_SETTINGS)
const poolQuery = (a, b) => pgPool.query(a, b)


pgPool.query('SELECT 1+1').then(async () => {
   const dbTables = await findDbTables(config.DB_SCHEMAS, poolQuery)
   await saveAllColumnsToFiles(dbTables, __dirname + '/domain', __dirname + '/models', PG_DATABASE, poolQuery)
   await createInterfaces(config.DB_SCHEMAS, PG_DATABASE, poolQuery, __dirname + '/domain')
   const sessionStore = createDbSessionStore(createQBuilder(poolQuery, config.SESSION_TABLE), config.SESSION_DURATION)
   // createSessionStoreInRAM(config.SESSION_DURATION)

   const server = http.createServer(async (req, res) => {
      const isResJson = !!req.headers['accept']?.includes('application/json')
      try {
         assert(req.method && req.url, 'Url data is incorrect')
         console.log({ url: req.url, method: req.method });

         let resData = await staticServer(req.url)
         if (resData) {
            res.writeHead(resData.statusCode, resData.headers)
            return res.end(resData.data)
         }

         const cookie = parseCookies(req)
         console.log({ cookie });
         const ip = req.socket.remoteAddress || ''
         const sessionObj = await startSession(cookie.session_id, ip, sessionStore)
         if (req.url.startsWith(config.API_PREFIX)) {
            // console.log({ cookie });
            const urlPostfix = req.url.substring(config.API_PREFIX.length)
            // console.log({ urlPostfix });
            const urlArr = urlPostfix.split('/').filter(el => el)
            if (urlArr.length === 1 && urlArr[0] === 'init') resData = createResponse(dbTables, 'OK')
            if (!resData && urlArr.length === 3) {
               const schema = urlArr[0]
               const table = urlArr[1]
               const action = kebabToCamelCase(urlArr[2])
               // console.log({ schema, table, action });
               const pgClient = await pgPool.connect()
               await pgClient.query('BEGIN')
               try {
                  let model = createSpModel(schema, table, pgClient, config.PUBLIC_DIR)
                  try {
                     const modelData = require(__dirname + `/models/${schema}/${table}.js`)
                     if (modelData && 'createModel' in modelData) model = modelData.createModel(model)
                  } catch (e) { /** Do Nothing */ }
                  if (action === 'cols') {
                     const apiData = await model.cols()
                     resData = createResponse(apiData.result, apiData.message, apiData.statusCode)
                  } else if (model[action]) {
                     const postArgs = await receiveArgs(req)
                     const apiData = await model[action](postArgs)
                     resData = createResponse(apiData.result, apiData.message, apiData.statusCode)
                  }
                  await pgClient.query('COMMIT')
               } catch (/** @type {any} */ e) {
                  console.error(e);
                  await pgClient.query('ROLLBACK')
                  const cookieHeader = await sessionObj.SaveSession()
                  res.writeHead(404, { 'Content-Type': 'application/json;', 'Set-Cookie': cookieHeader  })
                  let message = e.message
                  if (e.code === 'ENOENT') message = 'Не удалось найти файл или папку'
                  return res.end(JSON.stringify({ message }));
               } finally {
                  pgClient.release()
               }
            }
         }

         assert(resData, `Route for url="${req.url}" not found`)
         const cookieHeader = await sessionObj.SaveSession()
         console.log({ cookieHeader });
         if (cookieHeader) resData.headers['Set-Cookie'] = cookieHeader
         res.writeHead(resData.statusCode, resData.headers)
         // console.log({ headers: resData.headers });
         res.end(isResJson ? JSON.stringify(resData.data) : resData.data)
      } catch (/** @type {any} */ e) {
         console.error(e);
         const contentType = (isResJson ? 'application/json' : 'text/html') + '; charset=UTF-8'
         res.writeHead(404, { 'Content-Type': contentType })
         if (isResJson) res.end(JSON.stringify({ message: `Page '${req.url}' NOT FOUND!` }))
         else res.end('404 Not Found');
      }
   })
   server.listen(config.PORT, () => console.log('Server started on port', config.PORT))
})

