import {decodeJwt} from "./decodeJwt";

export function getJwtExp(token: string): number {
    const jwtData = decodeJwt(token);
    return jwtData?.exp || null;
}