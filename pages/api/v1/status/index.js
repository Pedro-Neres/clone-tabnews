import database from "infra/database.js";

async function status(request, response) {
  const updatedAt = new Date().toISOString();

  const getDbVersion = await database.query("SHOW server_version;");
  const version = getDbVersion.rows[0].server_version;

  const getMaxConnections = await database.query("SHOW max_connections;");
  const max_connections = parseInt(getMaxConnections.rows[0].max_connections);

  const dataBaseName = process.env.POSTGRES_DB;
  const getOpenedConnections = await database.query({
    text: " SELECT count(*)::int FROM pg_stat_activity WHERE datname = $1;",
    values: [dataBaseName],
  });
  const opened_connections = getOpenedConnections.rows[0].count;

  const dependencies = {
    database: {
      max_connections,
      opened_connections,
      version,
    },
  };

  response.status(200).send({
    updated_at: updatedAt,
    dependencies,
  });
}

export default status;
