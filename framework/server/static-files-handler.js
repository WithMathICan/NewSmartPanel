'use strict'

const path = require('node:path');
const fs = require('node:fs');

const MIME_TYPES = {
   html: 'text/html; charset=UTF-8',
   json: 'application/json; charset=UTF-8',
   js: 'application/javascript; charset=UTF-8',
   css: 'text/css',
   png: 'image/png',
   ico: 'image/x-icon',
   svg: 'image/svg+xml',
};

const HEADERS = {
   'X-XSS-Protection': '1; mode=block',
   'X-Content-Type-Options': 'nosniff',
   'Strict-Transport-Security': 'max-age=0; includeSubdomains; preload',
}

/**
 * @param {string} root
 * @param {string} url
 */
const findFilePath = (root, url) => new Promise(resolve => {
   const filePath = path.join(root, url);
   if (!filePath.startsWith(root)) resolve('')
   fs.lstat(filePath, (err, stat) => {
      if (err) return resolve('')
      if (stat.isDirectory()) {
         const indexPath = path.join(filePath, 'index.html')
         fs.lstat(indexPath, (err, indexStat) => {
            if (err) return resolve('')
            if (indexStat.isFile()) resolve(indexPath)
            return resolve('')
         })
      } else {
         if (stat.isFile()) return resolve(filePath)
         return resolve('')
      }
   })
})

const findFilePathForMultipleDirectories = async (rootFolders, url) => {
   for (const folder of rootFolders) {
      const file = await findFilePath(folder, url)
      if (file) return file
   }
   return ''
}

function findMimeType(filePath) {
   const fileExt = path.extname(filePath);
   const mimeType = MIME_TYPES[fileExt] ?? MIME_TYPES.html;
   return mimeType
}

/**
 * @param {string[]} staticFolders
 * @returns {import('./router').FStaticFilesHandler}
 */
function createStaticServer(staticFolders) {
   return async url => {
      const filePath = await findFilePathForMultipleDirectories(staticFolders, url)
      if (!filePath) return null
      const data = await fs.promises.readFile(filePath);
      const mimeType = findMimeType(filePath)
      return {
         headers: { ...HEADERS, 'Content-Type': mimeType },
         data,
         statusCode: 200,
      }
   }
}

module.exports = { createStaticServer }
