// Conventional cPanel/Passenger startup entry point.
const logger = require('./src/logger');

try {
  require('./src/server');
} catch (error) {
  logger.error('Application failed during startup.', error);
  console.error(error);
  process.exitCode = 1;
}
