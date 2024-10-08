import { Component, OnInit } from '@angular/core';
import {FormControl} from "@angular/forms";
import {AdminService} from "../../admin.service";
import {BehaviorSubject} from "rxjs";
import {AthleteService} from "../../../../services/athlete.service";
import {MessageService} from "primeng/api";
import {DateService} from "../../../../../../../shared/utils/date.service";
import Athlete from "../../../../../../../shared/classes/athlete.class";

@Component({
  selector: 'app-admin-commands',
  templateUrl: './admin-commands.component.html',
  styleUrls: ['./admin-commands.component.scss']
})
export class AdminCommandsComponent implements OnInit {

    public selectedAthletes = new FormControl<string[]>([]);
    public pendingActivityId = new FormControl<string>('');
    public allAthletes: BehaviorSubject<any> = this.athleteService.athletes;

    constructor(private adminService: AdminService,
                private athleteService: AthleteService,
                private messageService: MessageService
                ) { }

    ngOnInit(): void {
    }

    requestActivities() {
        this.adminService.requestActivities(this.selectedAthletes.value || [])
    }

    addPendingActivity() {
        if(this.selectedAthletes.value?.length === 1 && this.pendingActivityId.value) {
            this.adminService.addPendingActivity(this.selectedAthletes.value[0], this.pendingActivityId.value).subscribe(() => {
                this.selectedAthletes.setValue([]);
                this.pendingActivityId.setValue('');
            });
        }
    }

    startGame() {
        this.adminService.startGame(DateService.getToday()).subscribe(() => {
            this.messageService.add({severity:'success', summary:'Fasten your seatbelts!', detail: 'The game has started'})
        })
    }
}
