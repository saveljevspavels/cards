import {Component, EventEmitter, OnInit, Output, ViewEncapsulation} from '@angular/core';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {LocalStorageService} from "../../../../services/local-storage.service";
import {ConstService} from "../../../../services/const.service";
import {UtilService} from "../../../../services/util.service";

@Component({
  selector: 'app-card-filter',
  templateUrl: './card-filter.component.html',
  styleUrls: ['./card-filter.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardFilterComponent implements OnInit {

    @Output() filterChange = new EventEmitter;

    levels = [
        {
            title: 'Easy',
            description: `${ConstService.RULES.CARD_LEVELS["0"].min}-${ConstService.RULES.CARD_LEVELS["0"].max} points`
        },
        {
            title: 'Normal',
            description: `${ConstService.RULES.CARD_LEVELS["1"].min}-${ConstService.RULES.CARD_LEVELS["1"].max} points`
        },
        {
            title: 'Hard',
            description: `${ConstService.RULES.CARD_LEVELS["2"].min}-${ConstService.RULES.CARD_LEVELS["2"].max} points`
        },
        {
            title: 'Very Hard',
            description: `${ConstService.RULES.CARD_LEVELS["3"].min}-${ConstService.RULES.CARD_LEVELS["3"].max} points`
        },
        {
            title: 'Help me Jesus',
            description: `${ConstService.RULES.CARD_LEVELS["4"].min}+ points`
        }
    ]

    activities = Object.values(ConstService.CONST.ACTIVITY_TYPES).map(key => {
        return {
            key,
            title: key.charAt(0).toUpperCase() + key.slice(1)
        }
    })

    form: FormGroup = this.formBuilder.group({
        filterActivity: [LocalStorageService.getValue('filterActivity') || 'all']
    })

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.activities.unshift({
            key: 'all',
            title: 'All'
        })
        this.levels.forEach((_, i) => {
            const key = 'filterLevel_' + i;
            this.form.addControl(key, new FormControl(LocalStorageService.getState(key)));
        })

        this.form.valueChanges.subscribe((val) => {
            this.filterChange.emit(val);
            Object.entries(val).forEach((val: any) => {
                UtilService.saveState(val[1], val[0])
            })
        })
        this.form.updateValueAndValidity();
    }
}
