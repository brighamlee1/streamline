import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

async function getAllUsers(event: H3Event) {
    const query = getQuery(event);
    let active;

    if (query.active === 'true') active = true;
    if (query.active === 'false') active = false;

    // get all fitters
    const fitters = await prisma.user.findMany({
        where: {
            group: 'Fitter',
            ...(query.active && { active })
        },
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    });
    return fitters;
}

export default defineEventHandler((event: H3Event) => {
    return getAllUsers(event);
});
