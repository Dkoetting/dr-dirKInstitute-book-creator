const express = require('express');
const publicationOptions = require('../config/publication-options.json');
const umfangOptions = require('../config/Umfang.json');
const zielgruppenOptions = require('../config/Zielgruppe.json');

const router = express.Router();

router.get('/', (_req, res) => {
  res.json({
    bookTypes: publicationOptions.bookTypes || [],
    levels: publicationOptions.levels || [],
    lengths: publicationOptions.lengths || [],
    audiences: Array.isArray(zielgruppenOptions) ? zielgruppenOptions : [],
    umfang: Array.isArray(umfangOptions) ? umfangOptions : [],
  });
});

router.get('/publication-options', (_req, res) => {
  res.json(publicationOptions);
});

router.get('/umfang', (_req, res) => {
  res.json(umfangOptions);
});

router.get('/zielgruppe', (_req, res) => {
  res.json(zielgruppenOptions);
});

router.get('/zielgruppen', (_req, res) => {
  res.json(zielgruppenOptions);
});

module.exports = router;
