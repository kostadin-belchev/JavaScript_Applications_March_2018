const Promise = require('./Promise');

console.log('Before promise');

let p = new Promise(function (resolve, reject) {
  setTimeout(() => resolve("Success"), 1000);
});

console.log('After promise');

p.then((data) => console.log(data))
  .catch((reason) => console.warn(reason));