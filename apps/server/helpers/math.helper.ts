export default class MathHelper {
    static add(a: number, b: number): number {
        return parseInt(String(a || 0)) + parseInt(String(b || 0));
    }
}