import dayjs from 'dayjs';
import { emailTemplates } from './email-template.js';
import { EMAIL,EMAIL_PASSWORD } from '../config/env.js';


export const sendReminderEmail = async ({to, type, subscription}) => {
    if (!to || !type) throw new Error('Missing required parameters');

    const template = emailTemplates.find((t) => t.label === type);

    if(!template) throw new Error('Invalid email type');

    const mailInfo = {
        userName: subscription.user.name,
        subscriptionName: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format('MMM D, YYYY'),
        planName: subscription.name,
        price: `${subscription.currency} ${subscription.price} (${subscription.frequency})`,
        paymentMethod: subscription.paymentMethod,
    }

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo);

    const payload = {
        sender: {
            name: 'Renovo',
            email: EMAIL
        },
        to: [
            {
                email: to
            }
        ],
        subject: subject,
        htmlContent: message
    };

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': EMAIL_PASSWORD,
                'content-type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Brevo API Error: ${errorText}`);
        }

        console.log('Email sent successfully via Brevo API');
    } catch (error) {
        console.log(error, 'Error sending email');
    }
}

export default sendReminderEmail;