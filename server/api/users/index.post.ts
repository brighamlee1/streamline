import prisma from '@/utils/prisma';
import * as crypto from 'crypto';
import { H3Event } from 'h3';

interface CreateUserBody {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    group: string;
    name: string;
    active?: boolean;
}

async function createUser(event: H3Event) {
    const body: CreateUserBody = await readBody(event);

    // setting name related fields
    body.name = `${body.firstName} ${body.lastName}`;
    body.username = `${body.firstName.toLowerCase()}${body.lastName.toLowerCase()}`;

    // Check if the user already exists
    const exists = await prisma.user.findUnique({
        where: { username: body.username }
    });
    if (exists) {
        setResponseStatus(event, 400);
        return { status: 400, message: 'User already exists with that username' };
    }

    const defaultPassword = process.env.DEFAULT_USER_PASSWORD!;
    const hashedPassword = crypto.createHash('sha256').update(defaultPassword).digest('hex');

    // Create new user
    await prisma.user.create({ data: { ...body, password: hashedPassword } });

    return { status: 200, message: 'User created successfully' };
}

export default defineEventHandler((event: H3Event) => {
    return createUser(event);
});
