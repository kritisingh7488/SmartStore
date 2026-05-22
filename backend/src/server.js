require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const createApp = require('./app');
const connectDB = require('./config/db');

async function start() {
  await connectDB(process.env.MONGODB_URI);

  const app = createApp();
  const port = process.env.PORT || 5000;

  app.listen(port, () => {
    console.log(`SmartStore AI API running on http://localhost:${port}`);
  });
}

start().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});