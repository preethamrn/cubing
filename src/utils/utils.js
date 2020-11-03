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

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}

export {getFromLocalStorage, shuffle}
