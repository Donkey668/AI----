import { apiPort } from './config';
import { serve } from '@hono/node-server';
import { app } from './app';
serve({fetch:app.fetch,port:apiPort,hostname:'127.0.0.1'},info=>console.log(`API: http://127.0.0.1:${info.port}`));
