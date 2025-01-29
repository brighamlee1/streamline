import prisma from '@/utils/prisma';
import * as crypto from 'crypto';
import { H3Event } from 'h3';

interface UpdateUserBody {
    email?: string;
    username?: string;
    password?: string;
    forcePasswordChange?: boolean;
    firstName?: string;
    lastName?: string;
    name?: string;
    group?: string;
    active?: boolean;
}

async function update(event: H3Event) {
    const body: UpdateUserBody = await readBody(event);
    const id: number = Number(event.context.params?.id);

    let hashedPassword;

    // if user is changing password
    if (body.password || body.forcePasswordChange) {
        const defaultPassword = process.env.DEFAULT_USER_PASSWORD!;
        hashedPassword = crypto
            .createHash('sha256')
            .update(body.password ?? defaultPassword!)
            .digest('hex');
    }

    if (body.firstName && body.lastName) {
        body.name = `${body.firstName} ${body.lastName}`;
        body.username = `${body.firstName.toLowerCase()}${body.lastName.toLowerCase()}`;
    }

    // Update user
    await prisma.user.update({
        where: { id },
        data: { ...body, ...(hashedPassword && { password: hashedPassword }) }
    });

    return { status: 200, message: 'User updated successfully' };
}

export default defineEventHandler((event: H3Event) => {
    return update(event);
});
