import { Router } from 'express';
import authorize from '../middlewares/auth.middleware.js';
import { 
    createSubscription, 
    getUserSubscriptions,
    getSubscription,
    updateSubscription,
    deleteSubscription,
    cancelSubscription,
    getUpcomingRenewals
} from '../controllers/subscription.controller.js';

const subscriptionRouter = Router();


subscriptionRouter.get('/upcoming-renewals', authorize, getUpcomingRenewals);

subscriptionRouter.get('/:id', authorize, getSubscription);

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/:id', authorize, updateSubscription);

subscriptionRouter.delete('/:id', authorize, deleteSubscription);

subscriptionRouter.get('/', authorize, getUserSubscriptions);

subscriptionRouter.put('/:id/cancel', authorize, cancelSubscription);

export default subscriptionRouter;