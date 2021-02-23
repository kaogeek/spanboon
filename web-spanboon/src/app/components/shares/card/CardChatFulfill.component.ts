/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { Post } from 'src/app/models/Post';
import { AuthenManager, PageFacade } from 'src/app/services/services';
import { AbstractPage } from '../../pages/AbstractPage';

const PAGE_NAME: string = 'CardChatFulfill';

@Component({
    selector: 'card-chat-fulfill',
    templateUrl: './CardChatFulfill.component.html',
})
export class CardChatFulfill extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;

    @Input()
    public data: any[] = [];
    @Input()
    public chatRoomId: string = 'chatRoomId';
    @Input()
    public pageId: string = 'pageId';
    @Input()
    public postId: string = 'postId';
    @Input()
    public imageURL: string = '../../../../assets/img/customize_item.svg';
    @Input()
    public sender: string = 'ณัฐพงษ์ เรืองปัญญาวุฒิ';
    @Input()
    public pageName: string = 'pageName';
    @Input()
    public asPage: string = 'asPage';
    @Input()
    public itemName: string = 'คอหมูย่าง';
    @Input()
    public currentQuantity: number = 0;
    @Input()
    public newQuantity: number = 0;
    @Input()
    public itemUnit: string = 'กิโลกรัม';
    @Input()
    public message: string = 'message';
    @Input()
    public messageType: string = 'messageType';

    //Facade
    public pageFacade: PageFacade;
    // Variable
    public postData: Post;

    constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog, pageFacade: PageFacade) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.authenManager = authenManager;
        this.pageFacade = pageFacade;
        this.postData = undefined;
    }

    public ngOnInit(): void {
        this.findPagePost(this.pageId, this.postId).then((postData) => {
            for (const post of postData.data) {
                this.postData = post;
            }
        });
    }

    public ngOnDestroy(): void {
        super.ngOnDestroy();
    }

    public isPageDirty(): boolean {
        return false;
    }

    public onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
        return;
    }

    public onDirtyDialogCancelButtonClick(): EventEmitter<any> {
        return;
    }

    public viewPost(postId?: string) {
        if (postId !== null && postId !== undefined && postId !== '') {
            this.router.navigate([]).then(() => {
                window.open('/post/' + postId, '_blank');
            });
        } else {
            this.router.navigate([]).then(() => {
                window.open('/page/' + this.pageId, '_blank');
            });
        }
    }

    private async findPagePost(pageId: string, postId: string) {
        return this.pageFacade.findPagePost(pageId, postId);
    }
}
