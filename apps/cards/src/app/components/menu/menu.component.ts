import { Component, OnInit } from '@angular/core';
import {AthleteService} from "../../services/athlete.service";
import {AuthService} from "../../services/auth.service";

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

    routes: MenuRouteItem[] = [
        {
            label: 'Board',
            path: '/board/main',
            icon: 'pi pi-fw pi-home',
        },
        {
            label: 'Activity List',
            icon: 'pi pi-fw pi-calendar',
            path: '/board/activity-list'
        },
        {
            label: 'Leaderboard',
            icon: 'pi pi-fw pi-pencil',
            path: '/board/leaderboard'
        },
        {
            label: 'Profile',
            icon: 'pi pi-fw pi-file',
            path: '/board/profile'
        },
        {
            label: 'Admin',
            icon: 'pi pi-fw pi-cog',
            path: '/admin/game',
            permission: 'admin-panel'
        },
        {
            label: 'Card Management',
            icon: 'pi pi-fw pi-cog',
            path: '/admin/card-management',
            permission: 'card-management'
        },
        {
            label: 'Athlete Management',
            icon: 'pi pi-fw pi-cog',
            path: '/admin/athlete-management',
            permission: 'admin-panel'
        }
    ];

    activeItem: any;

    public filteredRoutes: any[] = [];

    constructor(private athleteService: AthleteService,
                private authService: AuthService) {
    }

    ngOnInit(): void {
        this.athleteService.permissions.subscribe(() => {
            // console.log('perms', this.athleteService.permissions)
            this.filteredRoutes = this.routes.filter(route => !route.permission || this.athleteService.hasPermission(route.permission))
        })

        this.activeItem = this.filteredRoutes.find(item => item.path === window.location.pathname)
    }

    logout() {
        this.authService.logout()
    }
}

export interface MenuRouteItem {
    label: string,
    icon: string,
    path?: string,
    permission?: string,
}
