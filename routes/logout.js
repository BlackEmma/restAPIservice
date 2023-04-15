const router = require('express').Router();
const { v4: uuidv4 } = require('uuid'); 
const { User } = require('../db/models');

router.get('/', async (req, res) => {
  const { id } = req.user;
  const newSessionId = uuidv4();

  try {
    await User.update({ refreshToken: null, sessionId: newSessionId }, { where: { id } });
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).send({ message: 'An error occurred during logout', error: err.message });
  }
});

module.exports = router;
