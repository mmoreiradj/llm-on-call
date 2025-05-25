import { connect } from "nats";
import { config } from "./config";
import { z } from "zod";

export const ManagedFieldSchema = z.object({
  manager: z.string(),
  operation: z.string(),
  apiVersion: z.string(),
  time: z.string(),
  fieldsType: z.string(),
  fieldsV1: z.record(z.any()),
});

export const MetadataSchema = z.object({
  name: z.string(),
  namespace: z.string(),
  uid: z.string(),
  resourceVersion: z.string(),
  creationTimestamp: z.string(),
  managedFields: z.array(ManagedFieldSchema).optional(),
});

export const InvolvedObjectSchema = z.object({
  kind: z.string(),
  namespace: z.string(),
  name: z.string(),
  uid: z.string(),
  apiVersion: z.string(),
  resourceVersion: z.string().optional(),
});

export const SourceSchema = z.object({
  component: z.string().optional(),
  host: z.string().optional(),
});

export const NatsMessageSchema = z.array(
  z.tuple([
    z.number(),
    z.object({
      tag: z.string(),
      kind: z.string(),
      apiVersion: z.string(),
      metadata: MetadataSchema,
      involvedObject: InvolvedObjectSchema,
      reason: z.string(),
      message: z.string(),
      source: SourceSchema,
      firstTimestamp: z.string().nullable(),
      lastTimestamp: z.string().nullable(),
      count: z.number().optional(),
      type: z.string(),
      eventTime: z.string().nullable(),
      action: z.string().optional(),
      reportingComponent: z.string().optional(),
      reportingInstance: z.string().optional(),
    }),
  ])
);

export type Metadata = z.infer<typeof MetadataSchema>;
export type InvolvedObject = z.infer<typeof InvolvedObjectSchema>;
export type Source = z.infer<typeof SourceSchema>;
export type NatsMessage = z.infer<typeof NatsMessageSchema>;

async function listen() {
  console.log("Starting NATS listener");
  const nc = await connect({ servers: config.natsServers });

  const sub = nc.subscribe("*");

  for await (const msg of sub) {
    const parsed = await NatsMessageSchema.safeParseAsync(
      JSON.parse(msg.data.toString())
    );
    if (!parsed.success) {
      console.error(
        "Failed to parse NATS message",
        parsed.error,
        msg.data.toString()
      );
      continue;
    }

    for (const [_, message] of parsed.data) {
      if (message.type !== "Normal") {
        console.log(message);
      }
    }
  }

  await nc.close();
}

export default listen;
