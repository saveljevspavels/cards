import {NextFunction, Request, response, Response} from "express";
import {decodeJwt} from "../../shared/utils/decodeJwt";
import {AuthHelper} from "./auth.helper";

export class AuthInterceptor {
    public static async interceptRequest(req: Request, res: Response, next: NextFunction) {
        if(req.method === "OPTIONS" || req.originalUrl.indexOf('auth') !== -1) {
            next();
            return;
        }
        let jwt = req.header('jwt') || '';
        if(!jwt) {
            res.status(401).send();
        }
        const decodedJwt = decodeJwt(jwt);
        const expired: boolean = AuthHelper.tokenExpired(decodedJwt.expiresAt);
        if(expired) {
            jwt = AuthHelper.createJwt(
                await AuthInterceptor.refreshToken(decodedJwt.refreshToken),
                decodedJwt.athleteId
            );
            res.set('Refreshed-Jwt', jwt);
        }
        if(!req.body) {
            req.body = {}
        }
        req.body.accessToken = decodeJwt(jwt).accessToken;
        next();
    }

    static async refreshToken(refreshToken: string): Promise<any> {
        return await AuthHelper.tokenRequest(
            AuthHelper.getRefreshConfig(refreshToken)
        ).catch(err => console.log('err', err));
    }

}
