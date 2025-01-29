import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

async function getUserById(event: H3Event) {
    const id: number = Number(event.context.params?.id);
    // user by id
    const user = await prisma.user.findUnique({ where: { id } });
    return user;
}

export default defineEventHandler((event: H3Event) => {
    return getUserById(event);
});
