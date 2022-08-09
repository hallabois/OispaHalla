import { getAuth } from 'firebase-admin/auth';
import { app } from "$lib/Auth_admin/auth";

export async function POST({ request }) {
    let body = await request.json();
    if(body.token == null) {
        return {
            status: 400,
            body: {
                message: "please include a token",
            }
        };
    }
    else {
        let token = body.token;

        try {
            let result = await getAuth(app).verifyIdToken(token);
            let info = {
                name: result.name,
                uid: result.uid,
                email: result.email,
                email_verified: result.email_verified,
                picture: result.picture
            };
            return {
                status: 200,
                body: {
                    message: "auth ok",
                    info
                }
            };
        }
        catch(e) {
            console.warn("Auth error:", e);
            return {
                status: 403,
                body: {
                    message: "auth failed",
                }
            };
        }

        
    }
}