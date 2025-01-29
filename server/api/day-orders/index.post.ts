import prisma from '@/utils/prisma';
import { H3Event } from 'h3';
import sendNotifications from "~/server/sendNotifications";

interface CreateDayOrderBody {
    id?: number;
    date?: string;
    remarks?: string;
    status?: string;
    shipmentDate?: string;
    deliveryDateRequested?: string;
    total?: number;
    fitterId: number;
    jobId: number;
    createdByFitter?: boolean;
}

async function createDayOrder(event: H3Event) {
    const body: CreateDayOrderBody = await readBody(event);
    let createdDayOrder: any;
    const createdByFitter = body.createdByFitter;
    delete body.createdByFitter;

    if (body.id) createdDayOrder = await prisma.dayOrder.findUnique({ where: { id: body.id } });

    // Create new day order
    if (!createdDayOrder) {
        createdDayOrder = await prisma.dayOrder.create({ data: body, include: { fitter: { select: { name: true } }, job: { select: { name: true, number: true } } } });
        if (createdDayOrder && createdByFitter) {
            const userTokens = await prisma.firebaseToken.findMany();
        
            const payload = userTokens.map((t) => {
                return { title: `Day Order Created by ${createdDayOrder.fitter?.name}`, body: `Day Order created on ${createdDayOrder.job.name} Job #${createdDayOrder.job.number}`,token: t.token }
            });
            console.log('sending notifications', payload)
            await sendNotifications(payload);
        }
    }

    return {
        status: 200,
        message: 'Day Order created successfully',
        dayOrder: createdDayOrder
    };
}

export default defineEventHandler((event: H3Event) => {
    return createDayOrder(event);
});
