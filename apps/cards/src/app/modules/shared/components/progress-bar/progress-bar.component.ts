import {Component, OnChanges, ViewEncapsulation} from '@angular/core';
import {FileService} from "../../../services/file.service";

@Component({
    selector: 'app-progress-bar',
    templateUrl: './progress-bar.component.html',
    styleUrl: './progress-bar.component.scss',
    encapsulation: ViewEncapsulation.None
})
export class ProgressBarComponent {

    public value = 0;
    public opacity = 0;
    public visible = false;

    constructor(private fileService: FileService) {
        this.fileService.uploadStatus.subscribe((status) => {
            if(!status) {
                return;
            }
            this.value = Math.ceil((status.loaded / status.total) * 100);
            if(status.active) {
                this.visible = true;
                this.opacity = 1;
            } else {
                setTimeout(() => {
                    this.opacity = 0;
                    setTimeout(() => {
                        this.visible = false;
                    }, 300);
                }, 500);
            }
        });
    }
}