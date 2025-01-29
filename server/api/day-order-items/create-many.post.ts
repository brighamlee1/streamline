import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

interface CreateManyDayOrderItemsBody {
    dayOrderId: number;
    quantityRequired: number;
    quantityBackOrder?: number;
    filledDir?: number;
    filledCust?: number;
    filledInv?: number;
    description: string;
    itemCost?: number;
    totalCost?: number;
}

async function createDayOrder(event: H3Event) {
    const body: CreateManyDayOrderItemsBody[] = await readBody(event);

    // Create new day order items
    const dayOrderItems = await prisma.dayOrderItem.createMany({ data: body });

    console.log(dayOrderItems);

    return { status: 200, message: 'Day Order Items created successfully' };
}

export default defineEventHandler((event: H3Event) => {
    return createDayOrder(event);
});
