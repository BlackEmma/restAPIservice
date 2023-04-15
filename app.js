require('dotenv').config();
const app = require('express')();
const config = require('./config/config.js');
const authMiddleware = require('./middleware/authToken.js');

const signinRouter = require('./routes/signin.js');
const signupRouter = require('./routes/signup.js');
const logoutRouter = require('./routes/logout.js');
const fileRouter = require('./routes/file.js');
const infoRouter = require('./routes/info.js');
const latencyRouter = require('./routes/latency.js');

const { sequelize } = require('./db/models');

const PORT = process.env.PORT ?? 3000;

config(app);

app.use('/signin', signinRouter);
app.use('/signup', signupRouter);
app.use('/logout', authMiddleware, logoutRouter);
app.use('/file', authMiddleware, fileRouter);
app.use('/info', authMiddleware, infoRouter);
app.use('/latency', authMiddleware, latencyRouter);

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connection established successfully');
    app.listen(PORT, () => console.log(`Server started at ${PORT} port`));
  })
  .catch((err) => {
    console.log('Failed to establish database connection:', err);
  });
