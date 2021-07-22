import {Component, Input, OnInit} from '@angular/core';
import {AdminService} from "../../admin.service";
import {FormBuilder, Validators} from "@angular/forms";

@Component({
  selector: 'app-card-instance-create',
  templateUrl: './card-instance-create.component.html',
  styleUrls: ['./card-instance-create.component.scss']
})
export class CardInstanceCreateComponent implements OnInit {

    @Input()
    public cardFactoryIds = []

    public form = this.formBuilder.group({
        tier: [1, [Validators.required, Validators.min(1), Validators.max(5)]],
        amount: [1, [Validators.required, Validators.min(1)]]
    })

    get createDisabled(): boolean {
        return !(this.form.valid && this.cardFactoryIds.length)
    }

    constructor(private formBuilder: FormBuilder,
                private adminService: AdminService) { }

    ngOnInit(): void {
    }

    submit() {
        this.adminService.createCardInstances({
            ...this.form.value,
            cardFactoryIds: this.cardFactoryIds
        }).subscribe()
    }

}
