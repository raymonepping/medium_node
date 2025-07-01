require('dotenv').config({ path: '.env.couchbase' });

const couchbase = require('couchbase');

const cluster = new couchbase.connect(`couchbase://${process.env.COUCHBASE_HOST}`, {
  username: process.env.COUCHBASE_USERNAME,
  password: process.env.COUCHBASE_PASSWORD,
});

const bucket = cluster.bucket(process.env.COUCHBASE_BUCKET);
const collection = bucket.scope(process.env.COUCHBASE_SCOPE).collection(process.env.COUCHBASE_COLLECTION);

// Example usage
collection.get('document-key', (error, result) => {
  if (error) {
    console.error('Error:', error);
    return;
  }
  console.log('Document found:', result.value);
});
