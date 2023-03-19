'use strict'

const {
   kebabToCamelCase, kebabToPascalCase, kebabToSnakeCase,
   pascalToCamelCase, pascalToKebabCase, pascalToSnakeCase,
   camelToKebabCase, camelToPascalCase, camelToSnakeCase,
   snakeToCamelCase, snakeToKebabCase, snakeToPascalCase,
} = require('./functions/string-cases')
const { slugify } = require('./functions/slugify')
const { createStaticServer } = require('./server/static-files-handler')

module.exports = {
   // SpLogger,
   // createPgPool,
   // createCRUD,
   // load,
   // initDbClientCreator,
   // md5,
   // randomToken,
   // randomString,
   // generateUUID,
   // isFileExist,
   // randomStringWithExactSize,
   // passwordHash,
   // passwordVerify,
   slugify,
   kebabToCamelCase,
   kebabToPascalCase,
   kebabToSnakeCase,
   pascalToCamelCase,
   pascalToKebabCase,
   pascalToSnakeCase,
   camelToKebabCase, camelToPascalCase, camelToSnakeCase,
   snakeToCamelCase,
   snakeToKebabCase,
   snakeToPascalCase,
   createStaticServer,
}
