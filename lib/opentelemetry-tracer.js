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

    const traceExporterOptions = { projectId: this.projectId };

    if (
      process.env.OPENTELEMETRY_LOGGER_ENABLED &&
      Boolean(process.env.OPENTELEMETRY_LOGGER_ENABLED)
    ) {
      traceExporterOptions.logger = this.logger;
    }

    this.exporter = new TraceExporter(traceExporterOptions);
    this.provider.addSpanProcessor(new SimpleSpanProcessor(this.exporter));
    this.provider.register();
    this.createTracerHOF = this.createTracerHOF.bind(this);
  }

  get tracer() {
    return opentelemetry.trace.getTracer(this.serviceName);
  }

  createTracerHOF(originalFunction) {
    const thisArg = {
      tracer: this.tracer,
    };

    return async function (...args) {
      return await originalFunction.call(thisArg, ...args);
    }.bind(this);
  }
}

module.exports = OpenTelemetryTracer;

exports.SpanKind = opentelemetry.SpanKind;
exports.CanonicalCode = opentelemetry.CanonicalCode;
