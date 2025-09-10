const { MongoMemoryServer } = require('mongodb-memory-server');

module.exports = async () => {
  // Create MongoDB Memory Server instance for all tests
  const mongod = new MongoMemoryServer();
  await mongod.start();
  
  // Store the instance globally so it can be accessed in teardown
  global.__MONGOD__ = mongod;
  
  // Set environment variables for testing
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  process.env.JWT_EXPIRES_IN = '1h';
  process.env.MONGODB_URI_TEST = mongod.getUri();
  
  // Disable external API calls during testing
  process.env.GEMINI_API_KEY = '';
  process.env.EMAIL_HOST = '';
  process.env.EMAIL_PORT = '';
  process.env.EMAIL_USER = '';
  process.env.EMAIL_PASS = '';
  
  console.log('🧪 Test environment setup complete');
};