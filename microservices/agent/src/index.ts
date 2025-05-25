// import { serve } from '@hono/node-server'
// import { Hono } from 'hono'

// const app = new Hono()

// app.get('/', (c) => {
//   return c.text('Hello Hono!')
// })

// serve({
//   fetch: app.fetch,
//   port: 3000
// }, (info) => {
//   console.log(`Server is running on http://localhost:${info.port}`)
// })

import "dotenv/config";
// import "./agent.js";
import listen from "./nats.js";

listen()
  .then(() => {
    console.log("NATS listener started");
  })
  .catch((err) => {
    console.error(err);
  });
