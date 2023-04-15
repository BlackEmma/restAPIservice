const router = require('express').Router();

router.get('/', (req, res) => {
  const { id } = req.user;
  res.status(200).json({ id });
});

module.exports = router;
