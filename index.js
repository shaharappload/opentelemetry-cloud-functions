"use strict";

const OpenTelemetryTracer = require("./lib/opentelemetry-tracer");
const createWinstonLogger = require("./lib/winston-logger");

class OpenTelemetryCloudFunctions {
  constructor(serviceName) {
    this._tracer = new OpenTelemetryTracer(serviceName, createWinstonLogger);
  }

  createTracerHOF(originalFunction) {
    return this._tracer.createTracerHOF(originalFunction);
  }
}

module.exports = OpenTelemetryCloudFunctions;
