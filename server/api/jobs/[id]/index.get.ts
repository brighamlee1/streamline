import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

async function getJobById(event: H3Event) {
    const id: number = Number(event.context.params?.id);
    // job by id
    const job = await prisma.job.findUnique({ where: { id } });
    return job;
}

export default defineEventHandler((event: H3Event) => {
    return getJobById(event);
});
