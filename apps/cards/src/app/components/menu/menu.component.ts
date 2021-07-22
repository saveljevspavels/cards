import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  public routes = [
    {
      title: 'Board',
      path: '/board'
    },
    {
      title: 'Activity List',
      path: '/board/activity-list'
    },
    {
      title: 'Leaderboard',
      path: '/board/leaderboard'
    },
    {
      title: 'Admin',
      path: '/admin',
      permission: 'admin-panel'
    },
    {
      title: 'Card Management',
      path: '/admin/card-management',
      permission: 'card-management'
    }
  ]

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.routes = this.routes.filter(route => !route.permission || this.authService.permissions.value[route.permission])
  }
}
