/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author: Americaso <treerayuth.o@absolute.co.th>
 */

import { Component } from '@angular/core';
import { AuthenManager } from './services/AuthenManager.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  private authenManager: AuthenManager;
  private router: Router;
  constructor(authenManager: AuthenManager, router: Router) {
    this.router = router;
    this.authenManager = authenManager;
   }

  public ngOnInit(): void {
    if(!this.authenManager.getUserToken()) {
      this.router.navigateByUrl("login");
    }
  }
}
