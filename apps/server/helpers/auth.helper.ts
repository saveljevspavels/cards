import axios from "axios";
import {CONST} from "../../../definitions/constants";
import {STRAVA_CONFIG} from "../../../definitions/stravaConfig";
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

    static createJwt(response: any, athleteId: string): string {
        return jwt.sign({
            expiresAt: response.data.expires_at,
            accessToken: response.data.access_token,
            refreshToken: response.data.refresh_token,
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
            `http://${CONST.STRAVA_BASE}/oauth/token`,
            null,
            config
        )
    }
}