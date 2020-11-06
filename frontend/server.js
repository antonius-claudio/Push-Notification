const express = require('express');
const bodyParser = require('body-parser')
const path = require('path');
const app = express();
app.use(express.static(path.join(__dirname, 'build')));

// access service-worker
app.get("/selfpush-sw.js", (req, res) => {
  res.sendFile(path.resolve(__dirname, "public", "selfpush-sw.js"));
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8080);