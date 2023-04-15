const router = require('express').Router();
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const generateToken = require('../utils/generateToken');
const { User } = require('../db/models');

router.post('/', async (req, res) => {
  const { id, password } = req.body;

  try {
    const userFromDb = await User.findOne({ where: { id } });

    if (userFromDb) {
      return res.status(409).json({ message: 'User with this email/phone number already exists!' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newSessionId = uuidv4();

    const newUser = await User.create({
      id,
      password: hashedPassword,
      sessionId: newSessionId,
    });

    const accessToken = generateToken({ id: newUser.id, sessionId: newUser.sessionId }, '10m');
    const refreshToken = generateToken({ id: newUser.id }, '7d', true);

    await User.update({ refreshToken }, { where: { id: newUser.id } });

    res.status(201).json({ accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ message: 'An error occurred during registration', error: err.message });
  }
});

module.exports = router;
