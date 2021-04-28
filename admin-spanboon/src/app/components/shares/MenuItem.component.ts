/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, OnInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Routes } from '../pages/MainPage.component';
import { Router } from '@angular/router';

@Component({
  selector: 'admin-menu-item',
  templateUrl: './MenuItem.component.html'
})
export class MenuItem implements OnInit {

  private router: Router;

  @Input()
  public menu: Routes;
  @Input()
  public isOpen: boolean;

  constructor(dialog: MatDialog, router: Router) {
    this.router = router;
  }

  public ngOnInit() {
  }

  public isActive(): boolean {
    if (this.menu.title === "จัดการเว็บไซต์" && (this.router.url === '/main/home_content/pageslide' || this.router.url === '/main/home_content/pagevideo')) {
      return true;
    } else {
      for (let item of this.menu.subRoutes) {
        if (item.path === this.router.url) {
          return true;
        }
      }
      return false;
    }
  }

  public isShowItem(): boolean {
    if (this.isOpen || this.isActive()) {
      return true;
    } else {
      return false;
    }
  }

  public openItems(): void {
    if (!this.isActive()) {
      this.isOpen = !this.isOpen;
    }
  }
}
