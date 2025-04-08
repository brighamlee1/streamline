import {H3Event} from "h3";
import prisma from '@/utils/prisma';
import sendNotifications from "~/server/sendNotifications";

export default defineEventHandler(async (event: H3Event) => {
    const body = await readBody(event);

    await sendNotificationsToAllSubscribers(body.userId);

    return { status: 200, message: 'Notifications sent' };
});

const sendNotificationsToAllSubscribers = async (userId: number) => {
    const userTokens = await prisma.firebaseToken.findMany({
        where: { userId: userId }
    });

    const payload = userTokens.map((t) => {
        return { title: 'Status Change', body: 'Status changed on day order to Filled', token: t.token, link: '/day-orders/25' }
    });

    const res = await sendNotifications(payload);
    console.log('background work done');
}