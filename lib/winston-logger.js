const opentelemetry = require("@opentelemetry/api");
const { createLogger, transports } = require("winston");
const { format } = require("logform");

function tracingFormat(serviceName) {
  const tracer = opentelemetry.trace.getTracer(serviceName);
  return format((info) => {
    const span = tracer.getCurrentSpan();
    if (span) {
      const context = span.context();
      info["trace.id"] = context.traceId;
      info["span.id"] = context.spanId;
    }
    return info;
  })();
}

const createWinstonLogger = (serviceName) => {
  const logger = createLogger({
    format: format.combine(tracingFormat(serviceName), format.json()),
    transports: [new transports.Console()],
  });
  return logger;
};

function rebindConsole(logger) {
  console.log = (message, ...args) => logger.info(message, ...args);
  console.info = (message, ...args) => logger.info(message, ...args);
  console.warn = (message, ...args) => logger.warn(message, ...args);
  console.error = (message, ...args) => logger.error(message, ...args);
  console.debug = (message, ...args) => logger.debug(message, ...args);
}

module.exports = { createWinstonLogger, rebindConsole };
