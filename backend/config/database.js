const mongoose = require('mongoose');

/**
 * MongoDB Connection Configuration
 */

// MongoDB connection options
const connectOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4,
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 10000,
  retryWrites: true,
  retryReads: true,
};

/**
 * Connect to MongoDB Database
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!mongoURI) {
      console.error('❌ MONGODB_URI not found in .env');
      console.log('💡 Please set MONGODB_URI in your .env file');
      console.log('📝 Example: MONGODB_URI=mongodb://localhost:27017/nutrition_assistant');
      
      // Fallback to in-memory storage if no MongoDB URI
      console.log('⚠️ Running in fallback mode - using in-memory storage');
      return null;
    }

    console.log('📡 Connecting to MongoDB...');

    const conn = await mongoose.connect(mongoURI, connectOptions);

    console.log('✅ MongoDB Connected!');
    console.log(`📊 DB: ${conn.connection.name}`);
    console.log(`🌐 Host: ${conn.connection.host}`);
    console.log(`🔌 Port: ${conn.connection.port}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;

  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
    console.log('⚠️ Continuing with in-memory storage...');
    return null;
  }
};

/**
 * Disconnect DB (optional)
 */
const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ MongoDB Disconnected');
  } catch (error) {
    console.error('❌ Error disconnecting MongoDB:', error.message);
  }
};

/**
 * Connection status
 */
const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

/**
 * Health check
 */
const isDatabaseHealthy = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return false;
    }
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    console.error('Health check failed:', error.message);
    return false;
  }
};

/**
 * Get database stats
 */
const getDatabaseStats = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return null;
    }
    
    const stats = await mongoose.connection.db.stats();
    return {
      collections: stats.collections,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      dataSize: (stats.dataSize / 1024 / 1024).toFixed(2) + ' MB',
      storageSize: (stats.storageSize / 1024 / 1024).toFixed(2) + ' MB',
      indexes: stats.indexes,
      indexSize: (stats.indexSize / 1024 / 1024).toFixed(2) + ' MB'
    };
  } catch (error) {
    console.error('Error getting DB stats:', error.message);
    return null;
  }
};

/**
 * Graceful shutdown
 */
const gracefulShutdown = async () => {
  console.log('🛑 Received shutdown signal...');
  
  if (mongoose.connection.readyState === 1) {
    await disconnectDB();
  }
  
  console.log('👋 Shutdown complete');
  process.exit(0);
};

// Register shutdown handlers
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGQUIT', gracefulShutdown);

/**
 * Check if MongoDB is connected
 */
const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get connection details
 */
const getConnectionDetails = () => {
  if (!isConnected()) {
    return { status: 'disconnected' };
  }
  
  return {
    status: getConnectionStatus(),
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    models: Object.keys(mongoose.models),
    readyState: mongoose.connection.readyState
  };
};

/**
 * ✅ CORRECT EXPORT - Export as an object with multiple functions
 */
module.exports = {
  connectDB,
  disconnectDB,
  getConnectionStatus,
  isDatabaseHealthy,
  getDatabaseStats,
  isConnected,
  getConnectionDetails,
  gracefulShutdown
};