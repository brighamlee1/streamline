import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

interface UpdateJobBody {
    name: string;
    number: string;
    active: boolean;
}

async function updateJob(event: H3Event) {
    const body: UpdateJobBody = await readBody(event);
    const id: number = Number(event.context.params?.id);

    // Update job
    const job = await prisma.job.update({ where: { id }, data: body });

    return { status: 200, message: 'Job updated successfully', job: job };
}

export default defineEventHandler((event: H3Event) => {
    return updateJob(event);
});
