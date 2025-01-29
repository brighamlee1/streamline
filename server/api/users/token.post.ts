import {H3Event} from "h3";
import prisma from '@/utils/prisma';

export default defineEventHandler(async (event: H3Event) => {
    const { token, userId, deviceId } = await readBody(event);

    const existingToken = await prisma.firebaseToken.findUnique({
        where: { token: token }
    });

    if (existingToken) return existingToken;

    // save the token to db
    return prisma.firebaseToken.create({
        data: { token, userId, deviceId }
    });
});
