'use strict'

const HEADERS = {
   'X-XSS-Protection': '1; mode=block',
   // 'X-Content-Type-Options': 'nosniff',
   // 'Strict-Transport-Security': 'max-age=31536000; includeSubdomains; preload',
   // 'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'POST, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type',
   'Content-Type': 'application/json; charset=UTF-8',
};

/**
 * @param {any} result
 * @param {string} message
 * @param {number} statusCode
 * @param {Record<string, string>} headers
 * @returns {import('./router').IServerResponse<{message: string, result: any}>}
 */
const createResponse = (result, message = 'OK', statusCode = 200, headers = HEADERS) => ({
   statusCode,
   data: { result, message },
   headers
})

module.exports = { createResponse }
