import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

async function getItemsByDayOrderId(event: H3Event) {
    const id: number = Number(event.context.params?.id);

    const items = await prisma.dayOrderItem.findMany({ where: { dayOrderId: id } });
    return items;
}

export default defineEventHandler((event: H3Event) => {
    return getItemsByDayOrderId(event);
});
