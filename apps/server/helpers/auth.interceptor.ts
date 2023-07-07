import {NextFunction, Request, response, Response} from "express";
import {decodeJwt} from "../../shared/utils/decodeJwt";
import {AuthHelper} from "./auth.helper";
import {CONST} from "../../../definitions/constants";

export class AuthInterceptor {
    public static async interceptRequest(req: Request, res: Response, next: NextFunction) {
        if(req.method === "OPTIONS" || req.originalUrl.indexOf('auth') !== -1 || req.originalUrl.indexOf('webhook') !== -1) {
            next();
            return;
        }
        let jwt = req.header('jwt') || '';
        if(!jwt) {
            res.status(401).send();
            return;
        }
        const decodedJwt = decodeJwt(jwt);
        const expired: boolean = AuthHelper.tokenExpired(decodedJwt.expiresAt || 0);
        if(expired) {
            jwt = AuthHelper.createJwt(
                await AuthInterceptor.refreshToken(decodedJwt.refreshToken),
                decodedJwt.athleteId
            );
            res.set('Refreshed-Jwt', jwt);
        }

        res.append('accessToken', decodeJwt(jwt).accessToken);
        res.append('athleteId', decodeJwt(jwt).athleteId);
        next();
    }

    static async refreshToken(refreshToken: string): Promise<any> {
        return await AuthHelper.tokenRequest(
            AuthHelper.getRefreshConfig(refreshToken)
        ).catch(err => console.log('err', err));
    }

}
