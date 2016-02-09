module.exports = [

  // 1. replace single file with local one
  {
    pattern: 'localhost',      // Match url you wanna replace
    responder:  "."
  },

];