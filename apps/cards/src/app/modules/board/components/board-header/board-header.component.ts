import {Component} from '@angular/core';
import {Router} from "@angular/router";
@Component({
  selector: 'app-board-header',
  templateUrl: './board-header.component.html',
  styleUrls: ['./board-header.component.scss']
})
export class BoardHeaderComponent {

  constructor(private router: Router) {
  }
  openProfile() {
    this.router.navigateByUrl('board/athletes/profile');
  }
}
