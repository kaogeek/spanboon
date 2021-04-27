/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SeoService } from './services/SeoService.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'newconsensus-web';


  public router: Router;

  constructor(router: Router , private seoSerive : SeoService) {
    this.router = router;
    this.router.events.subscribe((event) => { 
      window.scroll(0,0);
      this.seoSerive.showMeta();
    });
  } 

}
