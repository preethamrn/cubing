function getFromLocalStorage(name, defaultValue) {
  let value = localStorage.getItem(name)
  if (value === null) {
    value = defaultValue
  } else {
    value = JSON.parse(value)
    value = Object.assign(defaultValue, value)
  }
  return value
}

export {getFromLocalStorage}