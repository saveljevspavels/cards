import {Component, Input, OnInit} from '@angular/core';
import {StaticValidationService} from "../../../../../../../shared/services/validation.service";
import {BoardService} from "../../../../services/board.service";
import {Router} from "@angular/router";
import {Activity} from "../../../../../../../shared/interfaces/activity.interface";

@Component({
  selector: 'app-pending-activity',
  templateUrl: './pending-activity.component.html',
  styleUrls: ['./pending-activity.component.scss']
})
export class PendingActivityComponent implements OnInit {

  @Input() public activity: Activity;
  @Input() public styleClass: string;
  public activityType = '';
  public value = '';
  public active = false;
  public disabled = false;

  constructor(
      private boardService: BoardService,
      private router: Router
  ) { }

  ngOnInit(): void {
    this.activityType = StaticValidationService.normalizeActivityType(this.activity);
    // @ts-ignore
    this.value = this.activity[StaticValidationService.baseActivityTypeMap.get(this.activityType)];

    this.boardService.selectedActivity$.subscribe((activity: any) => {
      this.active = activity?.id === this.activity.id;
      this.disabled = !!activity?.id && !this.active;
    })
  }

  cancel() {
    this.boardService.deselectActivity();
  }

  submit() {
    this.boardService.activity = this.activity;
    this.router.navigateByUrl('board/submit-activity');
  }

  back() {
    this.router.navigateByUrl('board');
  }
}
