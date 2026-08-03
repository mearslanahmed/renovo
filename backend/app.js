import express from "express";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from '@clerk/express';
import { PORT } from './config/env.js';

import userRouter from './routes/user.routes.js';

import subscriptionRouter from './routes/subscription.routes.js';
import connectToDatabase from "./database/mongodb.js";
import errorMiddleware from "./middlewares/error.middleware.js";
import arcjetMiddleware from "./middlewares/arcjet.middleware.js";
import workflowRouter from "./routes/workflow.route.js";
import webhookRouter from './routes/webhook.routes.js';
const app = express();

app.use('/api/v1/webhooks', webhookRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1/workflows', workflowRouter);

app.use(clerkMiddleware());
app.use(arcjetMiddleware)
app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscriptions', subscriptionRouter);

app.get('/', (req, res) => {
    res.send('Renovo server is running!');
});

app.use(errorMiddleware);

app.listen(PORT, async () => {
    console.log(`Renovo API is running on port http://localhost:${PORT}`);

    await connectToDatabase();
});

export default app;