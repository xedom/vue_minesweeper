function createEnum(values) {
  const enumObject = {};
  for (const val of values) enumObject[val] = val;
  return Object.freeze(enumObject);
}


function convert(decNum, base) {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_-';
  if (decNum >= base) 
    return convert(Math.floor(decNum/base),base)+characters[(decNum%base)];
  return characters[decNum]
}
