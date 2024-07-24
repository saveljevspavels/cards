export default class MathHelper {
    static add(a: number, b: number): number {
        return parseInt(String(a || 0)) + parseInt(String(b || 0));
    }

    static toInt(value: any): number {
        return parseInt(value.toString(), 10);
    }
}