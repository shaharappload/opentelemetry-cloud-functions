const opentelemetry = require("@opentelemetry/api");
const {
  SimpleSpanProcessor,
  BasicTracerProvider,
} = require("@opentelemetry/tracing");
const {
  TraceExporter,
} = require("@google-cloud/opentelemetry-cloud-trace-exporter");

class OpenTelemetryTracer {
  constructor(serviceName, logger) {
    this.serviceName = serviceName;
    this.provider = new BasicTracerProvider();
    this.projectId = process.env.PROJECT_ID;

    if (!this.projectId) {
      throw Error("Missing environment variable: PROJECT_ID");
    }

    this.logger = logger(this.serviceName);
    this.exporter = new TraceExporter({
      projectId: this.projectId,
      logger: this.logger,
    });
    this.provider.addSpanProcessor(new SimpleSpanProcessor(this.exporter));
    this.provider.register();
    this.createTracerHOF = this.createTracerHOF.bind(this);
  }

  get _getTracer() {
    return opentelemetry.trace.getTracer(this.serviceName);
  }

  get _getLogger() {
    return this.logger;
  }

  createTracerHOF(originalFunction) {
    return async function (...args) {
      return await originalFunction.call(
        {
          tracer: this._getTracer(),
          logger: this._getLogger(),
        },
        ...args
      );
    }.bind(this);
  }
}

module.exports = OpenTelemetryTracer;

exports.SpanKind = opentelemetry.SpanKind;
exports.CanonicalCode = opentelemetry.CanonicalCode;
