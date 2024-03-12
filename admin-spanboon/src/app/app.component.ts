/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component } from '@angular/core';
import { AuthenManager } from './services/AuthenManager.service';
import { NavigationEnd, Router } from '@angular/router';
import { LoadingService } from './services/loading/loading.service';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private destroy = new Subject<void>();
  private authenManager: AuthenManager;
  private router: Router;

  public isLoading: boolean = false;
  constructor(authenManager: AuthenManager, router: Router,
    public loadingService: LoadingService) {
    this.router = router;
    this.authenManager = authenManager;

    this.router.events
      .pipe(filter((event: any) => event instanceof NavigationEnd), takeUntil(this.destroy))
      .subscribe((event: NavigationEnd) => {
        this.isLoading = true;
        setTimeout(() => {
          this.isLoading = false;
        }, 1000);
      });
  }

  public ngOnInit(): void {
    if (!this.authenManager.getUserToken()) {
      this.router.navigateByUrl("login");
    }
  }

  public ngOnDestroy(): void {
    this.destroy.next();
    this.destroy.complete();
  }
}
