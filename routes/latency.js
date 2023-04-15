const router = require('express').Router();

router.get('/', (req, res) => {
  const clientTimeStamp = parseInt(req.query.timestamp);
  const serverTimestamp = Date.now();

  res.status(200).json({ message: 'latency test', clientTimeStamp, serverTimestamp });
});

module.exports = router;
