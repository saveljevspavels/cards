export class DateService {
    static getToday(): string {
        const date = new Date()
        return DateService.getDateString(date);
    }

    static getDateString(date: Date): string {
        return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)}`;
    }

    static getLocalDate(dateTime: string) {
        const date = new Date(dateTime)
        return DateService.getDateString(date);
    }

    static getCurrentHour(): number {
        return parseInt(new Date().toLocaleString("lv-LV", { timeZone: "Europe/Riga" }).slice(-8).split(':')[0], 10);
    }
}