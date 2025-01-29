import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

async function getAllJobs(event: H3Event) {
    const query = getQuery(event);
    let active;

    if (query.active === 'true') active = true;
    if (query.active === 'false') active = false;

    // get all jobs
    const jobs = await prisma.job.findMany({
        where: {
            ...(query.active && { active })
        },
        orderBy: { name: 'asc' }
    });
    return jobs;
}

export default defineEventHandler((event: H3Event) => {
    return getAllJobs(event);
});
