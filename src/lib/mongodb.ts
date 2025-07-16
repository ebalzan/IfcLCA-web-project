import mongoose, { Mongoose } from 'mongoose'

declare global {
  var mongoose: {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null
  }
}

if (!global.mongoose) {
  global.mongoose = {
    conn: null,
    promise: null,
  }
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable')
}

const MONGODB_URI = process.env.MONGODB_URI
let cached = global.mongoose

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 10000,
      connectTimeoutMS: 10000,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(mongoose => {
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (e) {
    console.error('MongoDB connection error:', e)
    cached.promise = null
    throw e
  }
}
