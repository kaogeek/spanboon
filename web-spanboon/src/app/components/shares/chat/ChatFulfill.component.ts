/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Output } from '@angular/core';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { CHAT_MESSAGE_TYPE } from '../../../ChatMessageTypes';
import { AuthenManager } from '../../../services/services';
import { AbstractPage } from '../../pages/AbstractPage';

const PAGE_NAME: string = 'ChatFulfill';

@Component({
    selector: 'chat-fulfill',
    templateUrl: './ChatFulfill.component.html',
})
export class ChatFulfill extends AbstractPage implements OnInit {

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
    public linkUser: string = 'linkUser';
    @Input()
    public linkPage: string = 'linkPage';
    @Input()
    public imageURL: string = 'imageURL';
    @Input()
    public sender: string = 'sender';
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
    @Output()
    public submit: EventEmitter<any> = new EventEmitter();

    public fulfillItemName: string;
    public fulfillItemCurrentQuantity: string;
    public fulfillItemNewQuantity: string;
    public fulfillItemUnit: string;
    public fulfillItemImage: string;

    constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.authenManager = authenManager;

        this.fulfillItemName = '';
        this.fulfillItemImage = '';
        this.fulfillItemCurrentQuantity = '';
        this.fulfillItemNewQuantity = '';
        this.fulfillItemUnit = '';
    }

    public ngOnInit(): void {

        const messages: string[] = this.message.split(" ");

        if (this.messageType === CHAT_MESSAGE_TYPE.FULFILLMENT_REQUEST_CREATE || this.messageType === CHAT_MESSAGE_TYPE.FULFILLMENT_REQUEST_DELETE) {
            this.fulfillItemName = messages[1];
            this.fulfillItemCurrentQuantity = messages[2];
            this.fulfillItemUnit = messages[3];
        } else if (this.messageType === CHAT_MESSAGE_TYPE.FULFILLMENT_REQUEST_EDIT) {
            this.fulfillItemName = messages[1];
            this.fulfillItemCurrentQuantity = messages[3];
            this.fulfillItemUnit = messages[4];
            this.fulfillItemNewQuantity = messages[6];
        }
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

    public openItemFulFIll() {
        this.submit.emit();
    }
}
