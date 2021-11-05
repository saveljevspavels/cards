import { Component, OnInit } from '@angular/core';
import {AdminService} from "../../admin.service";
import {LogItem} from "../../../../interfaces/log-item";

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {

    public logs: LogItem[] = [];

    constructor(private adminService: AdminService) { }

    ngOnInit(): void {
        this.adminService.getLogs().subscribe((logs) => {
            // @ts-ignore
            this.logs = logs;
        })
    }

}
