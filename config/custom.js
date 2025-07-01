// config/custom.js
const { Services } = require("@directus/core");
const couchbaseAdapter = require("../src/services/couchbase-adapter");

module.exports = async (container) => {
  // Replace Directus DatabaseService adapter with Couchbase adapter
  container.extend(Services.DatabaseService, {
    adapter: couchbaseAdapter,
  });

  // You can add other configurations or overrides here if needed
};
