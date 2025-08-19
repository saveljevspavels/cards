import { Component, OnInit } from '@angular/core';
import {AdminService} from "../../admin.service";
import {LogItem} from "../../../../interfaces/log-item";
import {FormControl} from "@angular/forms";
import {ButtonType} from "../../../shared/components/button/button.component";

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

    public activeDay = '';
    public days: any = {};
    public allLogs: LogItem[] = [];
    public searchControl = new FormControl('');
    public searchResult: any = [];
    readonly ButtonType = ButtonType;

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.adminService.getLogs().subscribe((logs) => {
            // @ts-ignore
            this.allLogs = logs;
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
            this.activeDay = Object.keys(this.days)[Object.keys(this.days).length - 1];
        })

        this.searchControl.valueChanges.subscribe((value) => {
            this.searchResult = this.allLogs.filter(item => item.m.toString().toUpperCase().indexOf((value || '').toUpperCase()) !== -1);
        })
    }

    changeDay(day: string) {
        this.activeDay = day;
    }

}
