import {H3Event} from "h3";
import prisma from '@/utils/prisma';

export default defineEventHandler(async (event: H3Event) => {
    const query = getQuery(event);
    if (!query.userId || !query.deviceId) return { status: 400, message: 'User ID and Device ID are required' };

    const userId = Number(query.userId);

    const existingTokens = await prisma.firebaseToken.findMany({
        where: { userId: userId, deviceId: query.deviceId as string }
    });

    if (existingTokens.length === 0) return [];

    // delete the device token
    return prisma.firebaseToken.deleteMany({
        where: { userId: userId, deviceId: query.deviceId as string }
    });
});
