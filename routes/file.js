const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const util = require('util');
const { v4: uuidv4 } = require('uuid');
const { File } = require('../db/models');

// GET LIST OF FILES
router.get('/list', async (req, res) => {
  const listSize = parseInt(req.query.list_size) || 10;
  const page = parseInt(req.query.page) || 1;

  try {
    const { count, rows: files } = await File.findAndCountAll({
      offset: (page - 1) * listSize,
      limit: listSize,
    });

    const totalCountOfPages = Math.ceil(count / listSize);
    
    res.status(200).json({
      listSize,
      page,
      totalCountOfPages,
      files,
    });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred getting list of files', error: err.message });
  }
});

// GET INFO BY ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const file = await File.findOne({ where: { id }, raw: true });
    res.status(200).json({ file });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred getting file info', error: err.message });
  }
});

// UPLOAD
router.post('/upload', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ message: 'No files were uploaded' });
  }

  const file = req.files.file;

  const name = file.name;
  const extension = path.extname(name);
  const mimeType = file.mimetype;
  const size = file.size;
  const uploadDate = new Date();

  const uniqName = `${uuidv4()}${extension}`;
  const uploadPath = path.join(__dirname, '..', 'uploads', uniqName);

  try {
    await util.promisify(file.mv)(uploadPath);
    await File.create({
      name: uniqName,
      extension,
      mimeType,
      size,
      uploadDate,
    });

    res.status(200).json({ message: 'File uploaded successful' });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred uploading file', error: err.message });
  }
});

// UPDATE FILE BY ID
router.put('/update/:id', async (req, res) => {
  const { id } = req.params;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({ updated: false, message: 'No files were uploaded' });
  }

  const file = req.files.file;

  const name = file.name;
  const extension = path.extname(name);
  const mimeType = file.mimetype;
  const size = file.size;
  const uploadDate = new Date();

  const uniqName = `${uuidv4()}${extension}`;
  const uploadPath = path.join(__dirname, '..', 'uploads', uniqName);

  try {
    const oldFile = await File.findOne({ where: { id } });
    console.log(oldFile.name);

    if (!oldFile) {
      return res.status(404).json({ updated: false, message: 'File not found' });
    }

    const oldFilePath = path.join(__dirname, '..', 'uploads', oldFile.name);

    const updatedFileInfo = await File.update(
      {
        name: uniqName,
        extension,
        mimeType,
        size,
        uploadDate,
      },
      { raw: true, where: { id } },
    );

    if (!updatedFileInfo.length) {
      return res.status(500).json({ updated: false, message: 'An error occurred updating file info' });
    }

    fs.unlink(oldFilePath, async (err) => {
      if (err) {
        return res.status(500).json({ updated: false, message: 'An error occurred deleting old file', error: err.message });
      }

      await util.promisify(file.mv)(uploadPath);
      res.status(200).json({ updated: true });
    });
  } catch (err) {
    res.status(500).json({ updated: false, message: 'An error occurred updating file', error: err.message });
  }
});

// DELETE FILE BY ID
router.delete('/delete/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findOne({ where: { id } });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', file.name);
    fs.unlink(filePath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'An error occurred deleting file', error: err.message });
      }
    });
    const deletSuccess = await File.destroy({ where: { id } });
    deletSuccess
      ? res.status(200).json({ deleted: true })
      : res.status(500).json({ message: 'An error occurred deleting file', deleted: false });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred deleting file', error: err.message });
  }
});

// DOWNLOAD FILE BY ID
router.get('/download/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findOne({ where: { id } });

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', file.name);

    res.status(200).download(filePath, (err) => {
      if (err) {
        res.status(500).json({ message: 'An error occurred downloading file', error: err.message });
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred downloading file', error: err.message });
  }
});

module.exports = router;
