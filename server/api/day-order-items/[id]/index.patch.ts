import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

interface UpdateDayOrderItemBody {
    quantityRequired?: number;
    quantityBackOrder?: number;
    filledDir?: number;
    filledCust?: number;
    filledInv?: number;
    description?: string;
    itemCost?: number;
    totalCost?: number;
}

async function updateDayOrderTotalCost(id: number) {
    const dayOrderItems = await prisma.dayOrderItem.findMany({ where: { dayOrderId: id }, select: { totalCost: true } });
    const totalCost = dayOrderItems.reduce((acc, curr) => Number(acc) + Number(curr.totalCost), 0);

    await prisma.dayOrder.update({ where: { id: id }, data: { total: totalCost } });
}

async function updateDayOrderItem(event: H3Event) {
    const body: UpdateDayOrderItemBody = await readBody(event);
    const id: number = Number(event.context.params?.id);

    // Update dayOrderItem
    const dayOrderItem = await prisma.dayOrderItem.update({ where: { id }, data: body });

    if (body.quantityRequired || body.itemCost || body.totalCost) await updateDayOrderTotalCost(dayOrderItem.dayOrderId);

    return { status: 200, message: 'Day Order updated successfully', dayOrderItem: dayOrderItem };
}

export default defineEventHandler((event: H3Event) => {
    return updateDayOrderItem(event);
});
