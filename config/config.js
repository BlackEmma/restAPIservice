const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');


module.exports = function config(app) {
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(fileUpload());
};
