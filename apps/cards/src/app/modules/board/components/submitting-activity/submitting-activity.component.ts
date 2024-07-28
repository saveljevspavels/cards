import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {BoardService} from "../../../../services/board.service";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ActivityService} from "../../../../services/activity.service";
import {FileService} from "../../../../services/file.service";
import {Router} from "@angular/router";
import {PopupService} from "../../../../services/popup.service";
import {filter, first, map, mergeMap, startWith} from "rxjs/operators";
import {BehaviorSubject, combineLatest, Observable, Subject} from "rxjs";
import {ConstService} from "../../../../services/const.service";
import {Activity} from "../../../../../../../shared/interfaces/activity.interface";
import {CardService, ValidatedCard} from "../../../../services/card.service";
import {ValidationService} from "../../../../services/validation.service";
import {StaticValidationService,} from "../../../../../../../shared/services/validation.service";
import {ButtonType} from "../../../shared/components/button/button.component";
import {AthleteService} from "../../../../services/athlete.service";
import Athlete from "../../../../../../../shared/classes/athlete.class";

@Component({
  selector: 'app-submitting-activity',
  templateUrl: './submitting-activity.component.html',
  styleUrls: ['./submitting-activity.component.scss']
})
export class SubmittingActivityComponent implements OnInit, OnDestroy {

    @ViewChild('submitPopup', { static: true }) submitPopup: ElementRef;
    @ViewChild('deletePopup', { static: true }) deletePopup: ElementRef;
    @ViewChild('submitConfirmPopup', { static: true }) submitConfirmPopup: ElementRef;

    private submitConfirmation = new Subject;
    public notEnoughEnergy$ = new BehaviorSubject<boolean>(false);
    public athlete$: Observable<Athlete | null> = this.athleteService.me;

    public loading = false;
    public selectedActivity = this.boardService.selectedActivity$;
    public remainderActivity: Activity | null = null;

    public selectedCards: FormControl = new FormControl<ValidatedCard[]>([]);
    public commentControls: FormGroup = this.formBuilder.group({});
    public uploadedImages: FormGroup = this.formBuilder.group({});

    public activityType$ = this.selectedActivity.pipe(
        filter((activity) => !!activity),
        map((activity) => StaticValidationService.normalizeActivityType(activity!))
    );
    public currentProgress$ = combineLatest([
        this.activityType$,
        this.athlete$
    ]).pipe(map(([activityType, athlete]) => {
        // @ts-ignore
        return athlete?.baseCardProgress[activityType] as number;
    }));

    public form: FormGroup;

    constructor(private activityService: ActivityService,
                private formBuilder: FormBuilder,
                private fileService: FileService,
                private boardService: BoardService,
                private athleteService: AthleteService,
                private router: Router,
                private validationService: ValidationService,
                private cardService: CardService,
                private popupService: PopupService,) {}

    ngOnInit(): void {
        if(!this.boardService.activity) {
            this.exitSubmitMode();
        }
        this.initForm()

        combineLatest([
            this.selectedActivity,
            this.selectedCards.valueChanges.pipe(startWith([]))
        ]).subscribe(([activity, selectedCards]) => {
            if(!activity) {
                return;
            }
            this.remainderActivity = this.validationService.getActivityRemainder(activity, this.cardService.getPlainCards(selectedCards));
            this.updateEnergyCheck(selectedCards);
        });
    }

    exitSubmitMode() {
        this.router.navigateByUrl('board');
        this.boardService.deselectActivity();
    }

    openDeletePopup() {
        this.popupService.showPopup(this.deletePopup)
    }

    cancelDelete() {
        this.popupService.closePopup();
    }

    deleteActivity() {
        this.activityService.deleteActivity(this.boardService.activity.id).subscribe(() => {
            this.popupService.closePopup();
            this.router.navigateByUrl('board');
            this.boardService.deselectActivity();
        });
    }

    initForm() {
        this.form = this.formBuilder.group({
            selectedCards: [[]],
            selectedImages: [[]],
            selectedActivity: [''],
            comments: [[]]
        })
    }

    ngOnDestroy() {
        this.boardService.deselectActivity();
    }

    cancelSubmit() {
        this.loading = false;
        this.submitConfirmation.next(false);
        this.popupService.closePopup();
    }

    async submitActivity() {
        this.loading = true;

        const cardIds = this.selectedCards.value.map((validatedCard: ValidatedCard) => validatedCard.card.id);
        let images = cardIds
            .map((id: string) => this.uploadedImages.get(id)?.value);
        let comments = cardIds
            .map((id: string) => this.commentControls.get(id)?.value);


        this.submitConfirmation.pipe(first()).subscribe(async confirmed => {
            if(confirmed) {
                images = await Promise.all(images.map(async (imageGroup: File[]) => await this.fileService.uploadImages(imageGroup)))

                this.activityService.submitActivity(
                    this.boardService.activity.id,
                    cardIds,
                    images,
                    comments,
                ).subscribe(_ => {
                    this.boardService.deselectActivity();
                    this.router.navigateByUrl('board');
                    this.selectedCards.setValue([]);
                    this.commentControls.setValue({});
                    this.loading = false;
                }, (error => {
                    this.selectedCards.setValue([]);
                    this.commentControls.setValue({});
                    this.loading = false;
                }))
            }
        })

        if(images.find((imageSet: string[]) => !imageSet.length)) {
            this.popupService.showPopup(this.submitConfirmPopup);
        } else {
            this.confirmSubmit();
        }
    }

    updateEnergyCheck(selectedCards: ValidatedCard[]) {
        this.athlete$.pipe(first(), map((athlete) => athlete?.currencies.energy || 0)).subscribe((availableEnergy: number) => {
            this.notEnoughEnergy$.next(StaticValidationService.notEnoughEnergy(availableEnergy, this.cardService.getPlainCards(selectedCards)));
        });
    }

    confirmSubmit() {
        this.popupService.closePopup();
        this.submitConfirmation.next(true);
    }

    protected readonly ButtonType = ButtonType;
}
