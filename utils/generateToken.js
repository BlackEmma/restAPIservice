const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET;

function generateToken(payload, expiresIn = '10m', isRefreshToken = false) {
  const secret = isRefreshToken ? secretKey + '_refresh' : secretKey;
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
}

module.exports = generateToken;
