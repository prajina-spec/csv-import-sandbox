const express = require('express');
const router = express.Router();
const importController = require('../controllers/importController');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

router.post('/parse', upload.single('file'), importController.parseCsv);
router.post('/validate', importController.validateData);
router.post('/export-clean', importController.exportCleanCsv);
router.post('/export-errors', importController.exportErrorCsv);
router.get('/membership-types', importController.getMembershipTypes);

module.exports = router;
