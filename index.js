"use strict";

const OpenTelemetryTracer = require("./lib/opentelemetry-tracer");
const Logger = require("./lib/winston-logger");

class OpenTelemetryCloudFunctions {
  constructor(serviceName) {
    this._tracer = new OpenTelemetryTracer(
      serviceName,
      Logger.createWinstonLogger
    );
    Logger.rebindConsole(this._tracer.logger);
  }

  createTracerHOF(originalFunction) {
    return this._tracer.createTracerHOF(originalFunction);
  }
}

module.exports = OpenTelemetryCloudFunctions;
exports.SpanKind = OpenTelemetryTracer.SpanKind;
exports.CanonicalCode = OpenTelemetryTracer.CanonicalCode;
