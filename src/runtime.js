const { createApplication } = require('./app');
const logger = require('./logger');

function start(options = {}) {
  const application = createApplication(options);
  const port = options.port ?? application.config.port;
  const server = application.app.listen(port, () => {
    logger.info(`SEEE Activity Hub v${application.config.packageInfo.version} started on port ${port}.`);
    console.log(`SEEE Activity Hub running on port ${port}`);
  });

  server.on('error', error => {
    logger.error(`HTTP server could not start on port ${port}.`, error);
    console.error(error);
  });

  const shutdown = signal => {
    logger.info(`Application received ${signal}; shutting down.`);
    server.close(() => application.db.end().finally(() => process.exit(0)));
  };
  if (options.handleSignals !== false) {
    process.on('uncaughtException', error => { logger.error('Uncaught exception terminated the application.', error); console.error(error); process.exit(1); });
    process.on('unhandledRejection', reason => { logger.error('Unhandled promise rejection.', reason); console.error(reason); });
    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT', () => shutdown('SIGINT'));
  }

  return { ...application, server, port, shutdown };
}

module.exports = { start };
