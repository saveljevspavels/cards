import { Component, OnInit } from '@angular/core';
import {AuthService} from "../../services/auth.service";
import {AthleteService} from "../../services/athlete.service";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

    private routes = [
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
            title: 'Profile',
            path: '/board/profile'
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
        },
        {
            title: 'Athlete Management',
            path: '/admin/athlete-management',
            permission: 'admin-panel'
        }
    ]

    public filteredRoutes: any[] = [];

    constructor(private athleteService: AthleteService) {
    }

    ngOnInit(): void {
        this.athleteService.permissions.subscribe(() => {
            // console.log('perms', this.athleteService.permissions)
            this.filteredRoutes = this.routes.filter(route => !route.permission || this.athleteService.hasPermission(route.permission))
        })
    }
}
