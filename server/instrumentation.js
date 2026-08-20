import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { resourceFromAttributes } from "@opentelemetry/resources";



const traceExporter = new OTLPTraceExporter({
  url:
    process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ||
    "http://jaeger.tracing.svc.cluster.local:4318/v1/traces",
});

const sdk = new NodeSDK({
   resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "memories-api",
  }),

  traceExporter,

  instrumentations: [
    getNodeAutoInstrumentations(),
  ],
});

sdk.start();

console.log("OpenTelemetry tracing initialized");

process.on("SIGTERM", () => {
  sdk.shutdown()
    .then(() => console.log("OpenTelemetry shut down"))
    .catch((error) => console.error("Error shutting down OpenTelemetry", error))
    .finally(() => process.exit(0));
});