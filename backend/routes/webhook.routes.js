import { Router } from 'express';
import express from 'express';
import { clerkWebhook } from '../controllers/webhook.controller.js';

const webhookRouter = Router();

webhookRouter.post('/clerk', express.raw({ type: 'application/json' }), clerkWebhook);

export default webhookRouter;
