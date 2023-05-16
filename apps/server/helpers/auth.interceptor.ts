import {NextFunction, Request, response, Response} from "express";
import {decodeJwt} from "../../shared/utils/decodeJwt";
import {AuthHelper} from "./auth.helper";

export class AuthInterceptor {
    public static async interceptRequest(req: Request, res: Response, next: NextFunction) {
        if(req.method === "OPTIONS" || req.originalUrl.indexOf('auth') !== -1) {
            next();
            return;
        }
        const jwt: {[key: string]: any} = decodeJwt(req.header('jwt') || '');
        if(!jwt) {
            res.status(401).send();
        }
        const expired: boolean = AuthHelper.tokenExpired(jwt.expiresAt);
        if(expired) {
            const refreshedJwt: string = AuthHelper.createJwt(
                await AuthInterceptor.refreshToken(jwt.refreshToken),
                jwt.athleteId
            );
            res.set('Refreshed-Jwt', refreshedJwt);
        }
        next();
    }

    static async refreshToken(refreshToken: string): Promise<any> {
        return await AuthHelper.tokenRequest(
            AuthHelper.getRefreshConfig(refreshToken)
        ).catch(err => console.log('err', err));
    }

}
