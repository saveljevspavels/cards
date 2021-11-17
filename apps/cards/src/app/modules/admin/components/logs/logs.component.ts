import { Component, OnInit } from '@angular/core';
import {AdminService} from "../../admin.service";
import {LogItem} from "../../../../interfaces/log-item";

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

    public activeDay = '';
    public days: any = {};
    public allLogs: LogItem[] = [];

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.adminService.getLogs().subscribe((logs) => {
            // @ts-ignore
            this.allLogs = logs.reverse();
            // @ts-ignore
            this.days = logs.reduce((acc, log) => {
                const day = log.t.slice(0, 10);
                if(!acc[day]) {
                    acc[day] = [];
                }
                acc[day].push(log);
                return acc;
            }, {})
            // @ts-ignore
            this.activeDay = Object.keys(this.days)[0];
        })
    }

    changeDay(day: string) {
        this.activeDay = day;
    }

}
