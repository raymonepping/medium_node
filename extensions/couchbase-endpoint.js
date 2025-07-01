require('dotenv').config(); // Load environment variables from .env file
const couchbase = require('couchbase');

// Destructure environment variables
const { COUCHBASE_HOST, COUCHBASE_USERNAME, COUCHBASE_PASSWORD, COUCHBASE_BUCKET, COUCHBASE_SCOPE, COUCHBASE_COLLECTION } = process.env;

let clusterPromise = null;

// Function to initialize Couchbase cluster connection
async function getCluster() {
  if (!clusterPromise) {
    clusterPromise = couchbase.connect(`couchbase://${COUCHBASE_HOST}`, {
      username: COUCHBASE_USERNAME,
      password: COUCHBASE_PASSWORD,
    });
  }
  return clusterPromise;
}

module.exports = (async () => {
  const cluster = await getCluster();
  const bucket = cluster.bucket(COUCHBASE_BUCKET);
  return {
    client: 'custom-couchbase',
    connection: {
      cluster,
      bucket: COUCHBASE_BUCKET,
      scope: COUCHBASE_SCOPE,
      collection: COUCHBASE_COLLECTION,
    },
    wrapIdentifier: (value, origImpl) => origImpl(value),
  };
})();
