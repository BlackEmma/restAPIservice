const router = require('express').Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { User } = require('../db/models');
const generateToken = require('../utils/generateToken');

router.post('/', async (req, res) => {
  const { id, password } = req.body;

  try {
    const user = await User.findOne({ where: { id } });

    if (!user) {
      return res.status(400).json({ message: 'Invalid email/phone number or password!' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid email/phone number or password!' });
    }

    const newSessionId = uuidv4();

    const accessToken = generateToken({ id: user.id, sessionId: newSessionId }, '10m');
    const refreshToken = generateToken({ id: user.id }, '7d', true);

    await User.update({ refreshToken, sessionId: newSessionId }, { where: { id: user.id } });

    res.status(200).json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred during login', error: err.message });
  }
});

router.post('/new_token', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required' });
  }

  try {
    const user = await User.findOne({ where: { refreshToken } });
    if (!user) {
      return res.status(403).json({ message: 'Incorrect refresh token' });
    }

    const accessToken = generateToken({ id: user.id, sessionId: user.sessionId }, '10m');

    res.status(200).json({ accessToken });
  } catch (err) {
    res.status(400).json({ message: 'Invalid refresh token', error: err.message });
  }
});

module.exports = router;
