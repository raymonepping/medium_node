require('dotenv').config(); // Load environment variables from .env file
const Knex = require('knex');
const couchbase = require('couchbase');

// Destructure environment variables
const { COUCHBASE_HOST, COUCHBASE_USERNAME, COUCHBASE_PASSWORD, COUCHBASE_BUCKET, COUCHBASE_SCOPE, COUCHBASE_COLLECTION } = process.env;

// Custom Knex client for Couchbase
class CustomCouchbaseClient extends Knex.Client {
  constructor(config) {
    super(config);
    this.dialect = 'n1ql'; // Set the dialect to 'n1ql' for Couchbase
  }

  _driver() {
    return {}; // No driver required for Couchbase
  }

  // Method to execute a N1QL query
  async executeQuery(builder) {
    let query = builder.toSQL().sql; // Generate SQL query
    const bindings = builder.toSQL().bindings; // Get query bindings
    // Replace double quotes and square brackets with backticks for N1QL syntax
    query = query.replace(/"/g, '`').replace(/\[/g, '`').replace(/\]/g, '`');
    const options = { parameters: bindings };
    const { cluster } = this.config.connection;

    try {
      const result = await cluster.query(query, options); // Execute query
      return result.rows;
    } catch (err) {
      throw err; // Handle any errors
    }
  }
}

// Function to initialize Knex with the custom Couchbase client
async function initializeKnex() {
  const knexConfig = {
    client: CustomCouchbaseClient,
    connection: {
      cluster: await couchbase.connect(`couchbase://${COUCHBASE_HOST}`, {
        username: COUCHBASE_USERNAME,
        password: COUCHBASE_PASSWORD,
      }),
    },
  };
  return Knex(knexConfig);
}

// Initialize Knex outside the hooks to reuse the connection
let knex;
(async () => {
  knex = await initializeKnex();
})();

module.exports = {
  'items.create.before': async function (input, { database, schema, accountability, services }) {
    try {
      const cluster = knex.client.config.connection.cluster;
      const bucket = cluster.bucket(COUCHBASE_BUCKET);
      const collection = bucket.scope(COUCHBASE_SCOPE).collection(COUCHBASE_COLLECTION);
      await collection.upsert(`doc::${input.payload.id}`, input.payload);
    } catch (err) {
      throw new Error('Couchbase insert failed: ' + err.message);
    }
  },

  'items.update.before': async function (input, { database, schema, accountability, services }) {
    try {
      const cluster = knex.client.config.connection.cluster;
      const bucket = cluster.bucket(COUCHBASE_BUCKET);
      const collection = bucket.scope(COUCHBASE_SCOPE).collection(COUCHBASE_COLLECTION);
      await collection.replace(`doc::${input.keys[0]}`, input.payload);
    } catch (err) {
      throw new Error('Couchbase update failed: ' + err.message);
    }
  },

  'items.delete.before': async function (input, { database, schema, accountability, services }) {
    try {
      const cluster = knex.client.config.connection.cluster;
      const bucket = cluster.bucket(COUCHBASE_BUCKET);
      const collection = bucket.scope(COUCHBASE_SCOPE).collection(COUCHBASE_COLLECTION);
      await collection.remove(`doc::${input.keys[0]}`);
    } catch (err) {
      throw new Error('Couchbase delete failed: ' + err.message);
    }
  },
};
