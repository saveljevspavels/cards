import {Component, Input} from '@angular/core';
import {Router} from "@angular/router";
@Component({
  selector: 'app-board-header',
  templateUrl: './board-header.component.html',
  styleUrls: ['./board-header.component.scss']
})
export class BoardHeaderComponent {

  @Input() backButton = false;
  @Input() hideCurrencies = false;

  constructor(private router: Router) {
  }
  back() {
    if(!this.backButton) {
        return;
    }
    this.router.navigateByUrl('/board/main/tasks');
  }
}
