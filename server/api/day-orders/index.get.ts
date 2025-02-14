import prisma from '@/utils/prisma';
import { H3Event } from 'h3';

// const inProgressStatuses = ['Pending', 'Filled', 'Order Checked'];

// function parseStringToArray(string: string): undefined | string[] {
//     if (!string) return undefined;
//     const trimmedArray: any[] = [];
//     const productArray: string[] = string.split(',');
//
//     for (const item of productArray) {
//         const trimmedItem = item.trim();
//         trimmedArray.push(trimmedItem);
//     }
//
//     return trimmedArray;
// }

async function getAllDayOrders(event: H3Event) {
    const query = getQuery(event);
    let active;
    let complete;

    if (query.active === 'true') active = true;
    if (query.active === 'false') active = false;
    if (query.complete === 'true') complete = true;
    if (query.complete === 'false') complete = false;

    // get all day orders
    const dayOrders = await prisma.dayOrder.findMany({
        where: {
            ...(query.fitter && { fitterId: Number(query.fitter) }),
            ...(query.active && { job: { active: active } }),
            ...(query.job && { jobId: Number(query.job) }),
            ...(query.status && { status: String(query.status) }),
            ...(query.complete && complete && { status: { in: ['Delivered', 'Pricing Completed (If applicable)'] } }),
            ...(query.complete && !complete && { status: { notIn: ['Delivered', 'Pricing Completed (If applicable)'] } })
        },
        include: { items: true, job: true },
        orderBy: { deliveryDateRequested: 'desc' }
    });
    return dayOrders;
}

export default defineEventHandler((event: H3Event) => {
    return getAllDayOrders(event);
});
