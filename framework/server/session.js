/* eslint-disable camelcase */
'use strict'

const assert = require('node:assert')
const crypto = require('node:crypto')

/** @type {Record<string, import('domain/Secret').ISecretSession>} */
const sessions = {}

const initialSessionObj = (ip, SESSION_DURATION) => ({
   session_id: crypto.randomUUID(),
   data: {},
   ip_address: ip,
   created_at: new Date(),
   updated_at: new Date(),
   expires: Date.now() + SESSION_DURATION
})

function createSessionStoreInRAM(SESSION_DURATION) {
   /** @type {import('./session').ISessionStore} */
   const sessionInRAM = {
      async loadSession(session_id, ip) {
         try {
            assert(session_id, 'Session id is null')
            const sessionObj = sessions[session_id]
            assert(sessionObj, 'Session obj is null')
            assert(sessionObj.expires > Date.now())
            assert(sessionObj.ip_address === ip, 'IP is changed')
            return sessionObj
         } catch (e) {
            if (session_id && sessions[session_id]) delete sessions[session_id]
            return initialSessionObj(ip, SESSION_DURATION)
         }
      },
      /** @param {import('domain/Secret').ISecretSession} sessionObj */
      async saveSession(sessionObj) {
         // console.log({ sessions });
         if (sessionObj.expires - Date.now() < SESSION_DURATION / 2) sessionObj.expires = Date.now() + SESSION_DURATION
         sessions[sessionObj.session_id] = sessionObj
         return `session_id=${sessionObj.session_id}; SameSite=Lax; HttpOnly; Domain=localhost; Secure; Path=/api; Max-Age=${SESSION_DURATION / 1000};`
      }
   }
   return sessionInRAM
}

/**
 * @param {string | undefined} session_id
 * @param {string} ip
 * @param {import('./session').ISessionStore} sessionStore
 */
async function startSession(session_id, ip, sessionStore) {
   const sessionObj = await sessionStore.loadSession(session_id, ip)

   const SetKey = (/** @type {string} */ key, /** @type {any} */ value) => sessionObj.data[key] = value
   const GetKey = (/** @type {string} */ key) => sessionObj.data[key]
   const DelKey = (/** @type {string} */ key) => delete sessionObj.data[key]

   async function SaveSession() {
      return await sessionStore.saveSession(sessionObj)
   }

   return { SetKey, GetKey, DelKey, SaveSession }
}

/**
 * @param {import('sp-core/types').IQbuilder} sessionQBuilder
 * @returns {import('./session').ISessionStore}
 */
function createDbSessionStore(sessionQBuilder, SESSION_DURATION) {
   /** @type {import('./session').ISessionStore} */
   const store = {
      async loadSession(session_id, ip) {
         const SSID = Math.round(Math.random() * 100)
         console.log('SESSION LOAD', SSID);
         try {
            assert(session_id, 'Session id is null')
            const sql = `SELECT * FROM ${sessionQBuilder.tableName} WHERE session_id=$1`
            /** @type {import('domain/Secret').ISecretSession} */
            const sessionObj = await sessionQBuilder.queryFirst(sql, [session_id])
            assert(sessionObj, 'Session obj is null')
            assert(sessionObj.expires > Date.now())
            assert(sessionObj.ip_address === ip, 'IP is changed')
            console.log('LOADED', SSID);
            return sessionObj
         } catch (e) {
            const sql = `DELETE FROM ${sessionQBuilder.tableName} WHERE session_id=$1`
            if (session_id) await sessionQBuilder.queryAll(sql, [session_id])
            const initialObj = await sessionQBuilder.insert(initialSessionObj(ip, SESSION_DURATION))
            return initialObj
         }
      },
      /** @param {import('domain/Secret').ISecretSession} sessionObj */
      async saveSession(sessionObj) {
         try {
            assert(sessionObj.id, 'No id in Session Object')
            await sessionQBuilder.update(sessionObj.id, sessionObj)
            return `session_id=${sessionObj.session_id}; SameSite=Lax; HttpOnly; Domain=localhost; Secure; Path=/api; Max-Age=${SESSION_DURATION / 1000};`
         } catch (/** @type {any} */ e) {
            console.error('SESSION WAS NOT SAVED', e)
         }
      }
   }
   return store
}

module.exports = { createSessionStoreInRAM, startSession, createDbSessionStore }
