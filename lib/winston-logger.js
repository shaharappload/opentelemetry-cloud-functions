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

module.exports = createWinstonLogger;
