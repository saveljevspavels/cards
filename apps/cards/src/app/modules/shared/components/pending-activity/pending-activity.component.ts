import {Component, ElementRef, Input, OnInit, ViewChild} from '@angular/core';
import {StaticValidationService} from "../../../../../../../shared/services/validation.service";
import {BoardService} from "../../../../services/board.service";
import {Router} from "@angular/router";
import {Activity} from "../../../../../../../shared/interfaces/activity.interface";
import {RULES} from "../../../../../../../../definitions/rules";
import {Observable} from "rxjs";
import Athlete from "../../../../../../../shared/classes/athlete.class";
import {AthleteService} from "../../../../services/athlete.service";
import {PopupService} from "../../../../services/popup.service";
import {ActivityService} from "../../../../services/activity.service";

@Component({
  selector: 'app-pending-activity',
  templateUrl: './pending-activity.component.html',
  styleUrls: ['./pending-activity.component.scss']
})
export class PendingActivityComponent implements OnInit {

  @ViewChild('boostPopup', { static: true }) boostPopup: ElementRef;
  @Input() public activity: Activity;
  @Input() public styleClass: string;
  public activityType = '';
  public value = '';
  public active = false;
  public disabled = false;
  public athlete: Observable<Athlete | null> = this.athleteService.me;

  constructor(
      private boardService: BoardService,
      private athleteService: AthleteService,
      private activityService: ActivityService,
      private router: Router,
      private popupService: PopupService,
  ) { }

  ngOnInit(): void {
    this.activityType = StaticValidationService.normalizeActivityType(this.activity);
    this.value = this.getActivityValue();

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

  openBoost() {
    this.popupService.showPopup(this.boostPopup);
  }

  cancelBoost() {
    this.popupService.closePopup();
  }

  boostActivity() {
    this.activityService.boostActivity(this.activity.id).subscribe((res) => {
      this.activity = res.activity;
      this.value = this.getActivityValue();
      this.popupService.closePopup();
    });
  }

  getActivityValue() {
    // @ts-ignore
    return this.activity[StaticValidationService.baseActivityTypeMap.get(this.activityType)];
  }

  protected readonly RULES = RULES;
}
