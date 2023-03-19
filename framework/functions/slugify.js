'use strict'

/** @param {string} str */
function slugify(str) {
   return cyrilicToTranslit(str)
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
}

const cyrilicMap = new Map(Object.entries({
   'а': 'a',
   'б': 'b',
   'в': 'v',
   'д': 'd',
   'з': 'z',
   'й': 'y',
   'к': 'k',
   'л': 'l',
   'м': 'm',
   'н': 'n',
   'о': 'o',
   'п': 'p',
   'р': 'r',
   'с': 's',
   'т': 't',
   'у': 'u',
   'ф': 'f',
   'ь': '',
   'г': 'g',
   'и': 'i',
   'ъ': '',
   'ы': 'i',
   'э': 'e',
   'ґ': 'g',
   'е': 'e',
   'і': 'i',
   '\'': '',
   '’': '',
   'ʼ': '',
   'ё': 'yo',
   'ж': 'zh',
   'х': 'kh',
   'ц': 'ts',
   'ч': 'ch',
   'ш': 'sh',
   'щ': 'shch',
   'ю': 'yu',
   'я': 'ya',
}))

/** @param {string} str */
function cyrilicToTranslit(str) {
   let newStr = ''
   for (let i = 0; i < str.length; i++) {
      const symbol = cyrilicMap.get(str[i].toLowerCase())
      if (symbol) newStr += symbol
      else newStr += str[i]
   }
   return newStr
}

module.exports = { slugify }
