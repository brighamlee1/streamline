import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

interface UpdateDayOrderBody {
    date?: string;
    coj?: boolean;
    remarks?: string;
    status?: string;
    shipmentDate?: string;
    total?: number;
    fitterId?: number;
    jobId?: number;
}

async function updateDayOrder(event: H3Event) {
    const body: UpdateDayOrderBody = await readBody(event);
    const id: number = Number(event.context.params?.id);

    // Update dayOrder
    const dayOrder = await prisma.dayOrder.update({ where: { id }, data: body });

    return { status: 200, message: 'Day Order updated successfully', dayOrder: dayOrder };
}

export default defineEventHandler((event: H3Event) => {
    return updateDayOrder(event);
});
