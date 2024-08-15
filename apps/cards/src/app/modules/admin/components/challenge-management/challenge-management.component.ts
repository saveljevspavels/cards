import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from "@angular/forms";
import {AdminService} from "../../admin.service";
import {FileService} from "../../../../services/file.service";
import {
    ChallengeStatType,
    ProgressiveChallenge
} from "../../../../../../../shared/interfaces/progressive-challenge.interface";
import {ChallengeService} from "../../../../services/challenge.service";
import {MessageService} from "primeng/api";
import {CONST} from "../../../../../../../../definitions/constants";
import {generateId} from "../../../../../../../server/helpers/util";
import {ButtonType} from "../../../shared/components/button/button.component";

@Component({
    selector: 'app-challenge-management',
    templateUrl: './challenge-management.component.html',
    styleUrl: './challenge-management.component.scss',

})
export class ChallengeManagementComponent implements OnInit {

    public form: FormGroup;
    public ChallengeStatType = ChallengeStatType;
    public ACTIVITY_TYPES = CONST.ACTIVITY_TYPES;
    readonly ButtonType = ButtonType;
    public challenges$ = this.challengeService.challenges;

    constructor(private formBuilder: FormBuilder,
                private challengeService: ChallengeService,
                private messageService: MessageService,
                private fileService: FileService) { }

    ngOnInit(): void {
        this.initForm()
    }

    initForm(challengeToEdit: ProgressiveChallenge | null = null) {
        this.form = this.formBuilder.group({
            id: [challengeToEdit?.id || generateId()],
            targetValue: [challengeToEdit?.targetValue || 0],
            title: [challengeToEdit?.title || '', [Validators.required]],
            activityType: [challengeToEdit?.activityType || null],
            description: [challengeToEdit?.description || '', [Validators.required]],
            notes: [challengeToEdit?.notes || ['']],
            icon: challengeToEdit?.icon || '',
            color: challengeToEdit?.color || '',
            stat: [challengeToEdit?.stat || ChallengeStatType.DISTANCE, [Validators.required]],
            rewards: this.formBuilder.group({
                points: [challengeToEdit?.rewards?.points || 0, [Validators.required]],
                coins: [challengeToEdit?.rewards?.coins || 0, [Validators.required]],
                experience: [challengeToEdit?.rewards?.experience || 0, [Validators.required]],
            }),
            evaluateImmediate: [challengeToEdit?.evaluateImmediate || false]
        })
    }

    submit() {
        if(this.form.invalid) return;

        this.challengeService.createChallenge(this.form.value).subscribe(() => {
            this.initForm();
            this.messageService.add({severity:'success', summary:'Challenge successfully created/updated'})
        })
    }
}
