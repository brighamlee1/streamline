import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

async function getDayOrderById(event: H3Event) {
    const id: number = Number(event.context.params?.id);
    // day order by id
    const dayOrder = await prisma.dayOrder.findUnique({ where: { id }, include: { job: true } });
    return dayOrder;
}

export default defineEventHandler((event: H3Event) => {
    return getDayOrderById(event);
});
