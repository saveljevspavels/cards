import axios from "axios";
import {CONST} from "../../../definitions/constants";
// @ts-ignore
import {STRAVA_CONFIG} from "../../../definitions/stravaConfig.ts";
import jwt from "jsonwebtoken";

export class AuthHelper {
    static tokenExpired(expiresAt: number): boolean {
        return + new Date > ( expiresAt * 1000 );
    }

    static getRefreshConfig(refreshToken: string): {params: {[key: string]: string}} {
        return {
            params: {
                'client_id': STRAVA_CONFIG.STRAVA_CLIENT_ID,
                'client_secret': STRAVA_CONFIG.STRAVA_CLIENT_SECRET,
                'refresh_token': refreshToken,
                'grant_type': 'refresh_token'
            }
        }
    }

    static createJwt(data: any, athleteId: string): string {
        return jwt.sign({
            expiresAt: data.expires_at,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
            athleteId
        }, 'secret');
    }

    static getTokenConfig(code: string): {params: {[key: string]: string}} {
        return {
            params: {
                'client_id': STRAVA_CONFIG.STRAVA_CLIENT_ID,
                'client_secret': STRAVA_CONFIG.STRAVA_CLIENT_SECRET,
                'code': code,
                'grant_type': 'authorization_code'
            }
        }
    }

    static async tokenRequest(config: {params: {[key: string]: string}}) {
        return await axios.post(
            `${CONST.STRAVA_BASE}/oauth/token`,
            null,
            config
        )
    }
}