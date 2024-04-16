import {Component, ViewEncapsulation} from '@angular/core';
import {CommandsService} from "./services/commands.service";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AppComponent {
    constructor(private commandsService: CommandsService) {
        this.commandsService.init()
    }
}
