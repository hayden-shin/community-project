const express = require("express");
const app = express();

app.get('/', (req, res) => {
  console.log('server is running')
})

app.listen(3000);