import prisma from '@/utils/prisma';
import * as crypto from 'crypto';
import { H3Event } from 'h3';

async function login(event: H3Event) {
    const body = await readBody(event);

    const user = await prisma.user.findUnique({
        where: { username: body.username }
    });

    // Hash password
    const salt = 'YwEFMUnYTbZXXmWhMLQ9LhP4pJEt4c4XQm4FJ76P8AQiebzCvRL3nuB4cfeWx9GH';
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-next-line
    const hashedPassword = crypto.createHash('sha256', salt).update(body.password).digest('hex');

    if (!user || user.password !== hashedPassword) {
        // setResponseStatus(event, 401);
        return {
            status: 401,
            message: !user ? 'User does not exist' : 'Invalid username or password'
        };
    }

    if (!user.active) {
        // setResponseStatus(event, 401);
        return {
            status: 401,
            message: 'User is not active'
        };
    }

    return {
        user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            name: user.name,
            username: user.username,
            forcePasswordChange: user.forcePasswordChange,
            group: user.group
        }
    };
}

export default defineEventHandler((event: H3Event) => {
    return login(event);
});
