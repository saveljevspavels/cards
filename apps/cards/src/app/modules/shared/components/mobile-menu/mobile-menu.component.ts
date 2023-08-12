import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {AthleteService} from "../../../../services/athlete.service";
import {Router} from "@angular/router";
import {startWith} from "rxjs/operators";
import {MenuRouteItem} from "../../../../interfaces/menu-route-item";

@Component({
    selector: 'app-mobile-menu',
    templateUrl: './mobile-menu.component.html',
    styleUrls: ['./mobile-menu.component.scss']
})
export class MobileMenuComponent implements OnInit {

    @Output() activeTitle = new EventEmitter()
    @Input() admin = false;

    routes: any = {
        public: [
            {
                label: 'Activity Feed',
                icon: 'stars',
                path: '/board/activity-list'
            },
            {
                label: 'Dashboard',
                path: '/board/main',
                icon: 'gauge',
            },
            {
                label: 'Task Market',
                icon: 'board',
                path: '/board/board'
            },
            {
                label: 'Leaderboard',
                icon: 'leaderboard',
                path: '/board/leaderboard',
                permission: 'leaderboard'
            },
            {
                label: 'Profile',
                icon: 'profile',
                path: '/board/athletes/profile'
            },
            {
                label: 'Admin',
                icon: 'rules',
                path: '/admin/',
                permission: 'admin-panel'
            },
        ],
        admin: [
            {
                label: 'Activities',
                icon: 'pi pi-fw pi-cog',
                path: '/admin/activities',
                permission: 'admin-panel'
            },
            {
                label: 'Card Management',
                icon: 'pi pi-fw pi-cog',
                path: '/admin/card-management',
                permission: 'card-management'
            },
            {
                label: 'Card Scheme',
                icon: 'pi pi-fw pi-cog',
                path: '/admin/card-scheme',
                permission: 'card-management'
            },
            {
                label: 'Athlete Management',
                icon: 'pi pi-fw pi-cog',
                path: '/admin/athlete-management',
                permission: 'admin-panel'
            },
            // {
            //     label: 'Achievement Management',
            //     icon: 'pi pi-fw pi-star',
            //     path: '/admin/achievement-management',
            //     permission: 'admin-panel'
            // },
            {
                label: 'Logs',
                icon: 'pi pi-fw pi-list',
                path: '/admin/logs',
                permission: 'admin-logs'
            }
        ]
    }

    activeItem: any;

    public filteredRoutes: any = {};

    constructor(private athleteService: AthleteService,
                private router: Router) {
    }

    ngOnInit(): void {
        AthleteService.permissions.subscribe(() => {
            this.filteredRoutes = {
                public: [],
                admin: [],
            }
            Object.keys(this.routes).forEach((category: string) => {
                this.filteredRoutes[category] = []
                this.filteredRoutes[category] = this.routes[category].filter((route: any) => !route.permission || this.athleteService.hasPermission(route.permission))
            })
        })

        this.router.events.pipe(startWith(null)).subscribe((val) => {
            this.detectActiveItem();
            this.activeTitle.emit(this.activeItem?.label || this.getLocationName())
        });
    }

    detectActiveItem() {
        this.activeItem = Object.values(this.filteredRoutes).reduce((acc: MenuRouteItem[], items: any) => [...acc, ...items], [])
            .find((item: MenuRouteItem) => item.path === window.location.pathname)
    }

    getLocationName(): string {
        let { pathname } = window.location
        const parts = pathname.split('/')
        return parts[parts.length - 1].split('-').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
    }

}
