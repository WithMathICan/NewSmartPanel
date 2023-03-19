'use strict'

// 'kebab-case', 'camelCase', 'snake_case', 'PascalCase'
/** @typedef {(str: string) => string} FStrConvert */

/** @type {FStrConvert} */
const capitalizeFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);

/** @type {FStrConvert} */
const toLowerFirstLetter = str => str.charAt(0).toLowerCase() + str.slice(1);

// KEBAB ____________________________________________

/** @type {FStrConvert} */
const kebabToPascalCase = str => str.split('-').map(capitalizeFirstLetter).join('')

/** @type {FStrConvert} */
const kebabToCamelCase = str => toLowerFirstLetter(str.split('-').map(capitalizeFirstLetter).join(''))

/** @type {FStrConvert} */
const kebabToSnakeCase = str => str.split('-').join('_')

// CAMEL ___________________________________________

/** @type {FStrConvert} */
const camelToPascalCase = str => capitalizeFirstLetter(str)

/** @type {FStrConvert} */
const camelToKebabCase = str => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)

/** @type {FStrConvert} */
const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)

// SNAKE ______________________________________________

/** @type {FStrConvert} */
const snakeToPascalCase = str => str.split('_').map(capitalizeFirstLetter).join('')

/** @type {FStrConvert} */
const snakeToCamelCase = str => toLowerFirstLetter(str.split('_').map(capitalizeFirstLetter).join(''))

/** @type {FStrConvert} */
const snakeToKebabCase = str => str.split('_').join('-')

// PASCAL _____________________________________________

/** @type {FStrConvert} */
const pascalToCamelCase = str => toLowerFirstLetter(str)

/** @type {FStrConvert} */
const pascalToSnakeCase = str => camelToSnakeCase(pascalToCamelCase(str))

/** @type {FStrConvert} */
const pascalToKebabCase = str => camelToKebabCase(pascalToCamelCase(str))

module.exports = {
   kebabToCamelCase, kebabToPascalCase, kebabToSnakeCase,
   camelToPascalCase, camelToKebabCase, camelToSnakeCase,
   snakeToCamelCase, snakeToKebabCase, snakeToPascalCase,
   pascalToCamelCase, pascalToKebabCase, pascalToSnakeCase,
}
