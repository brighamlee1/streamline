import {initializeApp, getApps, cert, type ServiceAccount} from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import prisma from '~/utils/prisma';
import serviceAccount from './service-account';
// console.log(JSON.stringify(serviceAccount));

export default async function sendNotifications(payload: Payload[]) {
    const config = useRuntimeConfig();
    const app = getApps()[0] ?? initializeApp({ credential: cert(JSON.parse(JSON.stringify(serviceAccount)) as ServiceAccount), ...config.public.firebaseConfig });

    const messaging = getMessaging(app);

    try {
        const res = await messaging.send({
            notification: {
                title: payload[0].title,
                body: payload[0].body,
            },
            token: payload[0].token,
            webpush: { fcmOptions: { link: '/' }
            }
        })
        // const res = await messaging.sendEach(payload.map((p) => {
        //     return {
        //         notification: {
        //             title: p.title,
        //             body: p.body,
        //         },
        //         token: p.token,
        //     }
        // }));

        return res;
    } catch (error) {
        console.log(error);
        return error;
    }
}

async function deleteTokenFromDatabase(token: string) {
    // Delete the token from the database
    await prisma.firebaseToken.delete({ where: { token } });
}

interface Payload {
    title: string;
    body: string;
    token: string;
    link?: string;
}