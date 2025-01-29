import prisma from '@/utils/prisma';
import crypto from 'crypto';
import { H3Event } from 'h3';
import jwt from 'jsonwebtoken';
import dayjs from 'dayjs';

async function login(event: H3Event) {
    const body = await readBody(event);

    if (!process.env.JWT_SECRET) return { statusCode: 500, message: 'Unknown Error' };

    const raw_user = await prisma.user.findUnique({ where: { username: body.username } });

    const hash = crypto.createHash('sha256').update(body.password).digest('hex');

    if (!raw_user) return { statusCode: 401, message: `User not found with ${body.username}` };
    if (raw_user.password !== hash) return { statusCode: 401, message: `Invalid Password` };
    if (!raw_user.active) return { statusCode: 401, message: `User is not active` };

    const user = {
        id: raw_user.id,
        email: raw_user.email,
        firstName: raw_user.firstName,
        lastName: raw_user.lastName,
        name: raw_user.name,
        username: raw_user.username,
        forcePasswordChange: raw_user.forcePasswordChange,
        group: raw_user.group
    };

    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '16h' });

    setCookie(event, 'dayorders_user', JSON.stringify({ token, user }), {
        path: '/',
        secure: true,
        sameSite: 'lax',
        expires: dayjs().add(16, 'hours').toDate()
    });

    return { statusCode: 200, token, user };
};

export default defineEventHandler((event: H3Event) => {
    return login(event);
});
