/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, Input } from '@angular/core';


@Component({
  selector: 'recommend-card',
  templateUrl: './RecommendCard.component.html'
})
export class RecommendCard {

    @Input()
    public images: string = "https://pbs.twimg.com/media/EOoioS8VAAAy6lO.jpg";
    @Input()
    public data: any; 
    @Input()
    public title: string; 
    public isIconPage: boolean;
     
  constructor() {    
    
  }
  public ngOnInit(): void { 
    
  }
  
  
}
