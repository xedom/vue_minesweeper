function createEnum(values) {
  const enumObject = {};
  for (const val of values) enumObject[val] = val;
  return Object.freeze(enumObject);
}