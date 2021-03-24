/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { publish } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'card-contact-home',
    templateUrl: './CardContentHome.component.html'
})
export class CardContentHome {


    @Input()
    public postData: any;

    @Input()
    public smallCard: boolean;
    @Input()
    public mediumCard: boolean;
    @Input()
    public largeCard: boolean;
    @Input()
    public eventCard: boolean;

    public amountSocial: number = 0;
    public isOfficial: boolean = true;
    public apiBaseURL = environment.apiBaseURL;

    ngOnInit(): void {
        this.amountSocial = (this.postData.likeCount + this.postData.repostCount + this.postData.shareCount)
    }

    ngOnChanges(changes: SimpleChanges): void {
    }

}

