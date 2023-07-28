export class DateService {
    static getToday(): string {
        const date = new Date()
        return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
    }

    static getCurrentHour(): number {
        return parseInt(new Date().toLocaleString("lv-LV", { timeZone: "Europe/Riga" }).slice(-8).split(':')[0], 10);
    }
}