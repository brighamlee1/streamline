import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

interface CreateJobBody {
    name: string;
    number: string;
    active: boolean;
}

async function createJob(event: H3Event) {
    const body: CreateJobBody = await readBody(event);

    // Create new job
    const job = await prisma.job.create({ data: body });

    return { status: 200, message: 'Job created successfully', job: job };
}

export default defineEventHandler((event: H3Event) => {
    return createJob(event);
});
