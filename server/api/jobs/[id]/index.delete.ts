import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

async function deleteJobById(event: H3Event) {
    const id: number = Number(event.context.params?.id);
    // delete job by id
    await prisma.job.delete({ where: { id } });
    return { status: 200 };
}

export default defineEventHandler((event: H3Event) => {
    return deleteJobById(event);
});
