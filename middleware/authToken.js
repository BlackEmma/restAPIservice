const jwt = require('jsonwebtoken');
const { User } = require('../db/models');
const secretKey = process.env.JWT_SECRET;

async function authorization(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied - no authorization header'});
  }
  
  const [authScheme, token] = authHeader.split(' ');

  if (authScheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Access denied - invalid token format'});
  }

  try {
    const decodedData = jwt.verify(token, secretKey);

    const user = await User.findOne({where: { id: decodedData.id, sessionId: decodedData.sessionId}});
    if (!user) {
      return res.status(401).json({ message: 'Authorisation failed'});
    }
    
    req.user = decodedData;
    next();
  } catch (err) {
    return res.status(400).json({ message: 'Authorisation failed: invalid or expired token', error: err.message});
  }
}

module.exports = authorization;
