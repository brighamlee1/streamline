import jwt from 'jsonwebtoken';

export default defineEventHandler(async (event) => {
    try {
        const url = getRequestURL(event);

        if (!url.pathname.startsWith('/api') || url.pathname.startsWith('/api/auth')) return;

        const cookies = parseCookies(event);

        const dayorders_user_cookie = cookies['dayorders_user'];

        if (!dayorders_user_cookie) {
            return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }));
        }

        const parsed_dayorders_user_cookie = JSON.parse(dayorders_user_cookie);

        if (!parsed_dayorders_user_cookie?.token) return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }));

        jwt.verify(parsed_dayorders_user_cookie.token, process.env.JWT_SECRET!);
    } catch (error) {
        console.trace(error);
        return sendError(event, createError({ statusCode: 401, statusMessage: 'Unauthorized' }));
    }
});
