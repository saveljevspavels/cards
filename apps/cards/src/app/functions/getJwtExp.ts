import {decodeJwt} from "../../../../shared/utils/decodeJwt";

export function getJwtExp(token: string): number {
    const jwtData = decodeJwt(token);
    return jwtData?.exp || null;
}