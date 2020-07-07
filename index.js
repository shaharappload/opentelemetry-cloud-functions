"use strict";

const {
  OpenTelemetryTracer,
  SpanKind,
  CanonicalCode,
} = require("./lib/opentelemetry-tracer");
const Logger = require("./lib/winston-logger");

class OpenTelemetryCloudFunctions {
  constructor(serviceName) {
    this._tracer = new OpenTelemetryTracer(
      serviceName,
      Logger.createWinstonLogger
    );
    if (process.env.ENABLE_LOGGER_INTEGRATION) {
      Logger.rebindConsole(this._tracer.logger);
    }
  }

  createTracerHOF(originalFunction) {
    return this._tracer.createTracerHOF(originalFunction);
  }
}

module.exports = {
  OpenTelemetryCloudFunctions,
  SpanKind,
  CanonicalCode,
};
