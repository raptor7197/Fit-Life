module.exports = async () => {
  // Stop the MongoDB Memory Server instance
  if (global.__MONGOD__) {
    await global.__MONGOD__.stop();
  }
  
  console.log('🧪 Test environment teardown complete');
};