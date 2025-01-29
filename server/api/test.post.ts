import {H3Event} from "h3";
import prisma from '@/utils/prisma';
import sendNotifications from "~/server/sendNotifications";

export default defineEventHandler(async (event: H3Event) => {
    const body = await readBody(event);

    const userTokens = await prisma.firebaseToken.findMany({
        where: { userId: body.userId }
    });

    const payload = userTokens.map((t) => {
        return { title: 'Status Change', body: 'Status changed on day order to Filled', token: t.token }
    });

    const res = await sendNotifications(payload);

    console.log(res);

    return { status: 200, message: 'Notifications sent' };
});
