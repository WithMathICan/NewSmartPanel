/* eslint-disable camelcase */
'use strict'
const assert = require('node:assert')

/**  @param {import('node:http').IncomingMessage} req */
function parseCookies(req) {
   /** @type {import('sp-core/types').ICookie} */
   const list = {};
   const rc = req.headers.cookie;

   rc && rc.split(';').forEach((cookie) => {
      const parts = cookie.split('=');
      const key = parts.shift()
      if (key) list[key.trim()] = decodeURI(parts.join('='));
   });

   return list;
}

/**  @param {import('node:http').IncomingMessage} req */
async function receiveArgs(req) {
   try {
      const buffers = [];
      for await (const chunk of req) buffers.push(chunk);
      const data = Buffer.concat(buffers).toString();
      if (!data) return {}
      const parsedData = JSON.parse(data);
      assert(typeof parsedData === 'object', 'ParsedData should be an object')
      return parsedData
   } catch (/** @type {any} */ e) {
      console.error(e);
      return {}
   }
}

module.exports = { parseCookies, receiveArgs }
