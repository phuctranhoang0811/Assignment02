const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Question bank đang chạy!');
});

module.exports = router;