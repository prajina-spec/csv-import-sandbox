const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const uploadRouter = require('./routes/upload');

const app = express();

app.use(bodyParser.json());
app.use('/api/upload', uploadRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
