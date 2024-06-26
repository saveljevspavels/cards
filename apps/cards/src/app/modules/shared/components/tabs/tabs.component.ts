import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import {TabItem} from "../../../../interfaces/tab-item";
import {NavigationEnd, Router} from "@angular/router";
import {filter, startWith} from "rxjs/operators";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})
export class TabsComponent implements OnInit, OnDestroy {

  @Input() tabs: TabItem[];
  public activeTab: TabItem | null;
  public routerSubscription: Subscription;

  constructor(
      private router: Router
  ) { }

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        startWith(null),
    ).subscribe((val) => {
      this.detectActiveItem();
    });
  }

  detectActiveItem() {
    this.activeTab = this.tabs.find((item: TabItem) => (item.path === window.location.pathname)) || null;
  }

  public activateTab(tab: TabItem) {
    this.router.navigateByUrl(tab.path);
  }

    ngOnDestroy(): void {
        this.routerSubscription.unsubscribe();
    }

}
