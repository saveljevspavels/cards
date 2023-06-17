import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {UtilService} from "../../../../services/util.service";
import {StaticValidationService} from "../../../../../../../shared/services/validation.service";
import {BoardService} from "../../../../services/board.service";
import {filter} from "rxjs/operators";

@Component({
  selector: 'app-pending-activity',
  templateUrl: './pending-activity.component.html',
  styleUrls: ['./pending-activity.component.scss']
})
export class PendingActivityComponent implements OnInit {

  @Input() public activity: any;
  public activityType = '';
  public value = '';
  public active = false;
  public disabled = false;

  constructor(private boardService: BoardService) { }

  ngOnInit(): void {
    this.activityType = UtilService.normalizeActivityType(this.activity.type);
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
  }
}
