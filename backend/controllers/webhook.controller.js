import { Webhook } from 'svix';
import { CLERK_WEBHOOK_SECRET } from '../config/env.js';
import User from '../models/user.model.js';

export const clerkWebhook = async (req, res) => {
    const SIGNATURE_HEADER = 'svix-signature';
    const TIMESTAMP_HEADER = 'svix-timestamp';
    const ID_HEADER = 'svix-id';

    if (!CLERK_WEBHOOK_SECRET) {
        return res.status(500).json({ error: 'CLERK_WEBHOOK_SECRET is not defined' });
    }

    const headers = req.headers;
    const payload = req.body;

    const signature = headers[SIGNATURE_HEADER];
    const timestamp = headers[TIMESTAMP_HEADER];
    const id = headers[ID_HEADER];

    if (!signature || !timestamp || !id) {
        return res.status(400).json({ error: 'Missing svix headers' });
    }

    let event;

    try {
        const wh = new Webhook(CLERK_WEBHOOK_SECRET);
        event = wh.verify(payload, headers);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }

    const { id: clerkId, email_addresses, first_name, last_name } = event.data;
    const eventType = event.type;

    try {
        if (eventType === 'user.created') {
            const email = email_addresses[0]?.email_address;
            const name = `${first_name || ''} ${last_name || ''}`.trim() || 'New User';

            const user = new User({
                clerkId,
                name,
                email
            });
            await user.save();
            console.log(`Clerk Webhook: Created user ${clerkId}`);
        } else if (eventType === 'user.deleted') {
            await User.findOneAndDelete({ clerkId });
            console.log(`Clerk Webhook: Deleted user ${clerkId}`);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Clerk Webhook DB Error:', error);
        return res.status(500).json({ error: 'Database error' });
    }
};
