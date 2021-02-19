/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Output } from '@angular/core';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { interval, Observable, Subject, Subscription, timer } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { FULFILLMENT_STATUS } from '../../../FulfillmentStatus';
import { Asset } from '../../../models/models';
import { AssetFacade, AuthenManager, ChatFacade, ChatRoomFacade, ObservableManager } from '../../../services/services';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { environment } from '../../../../environments/environment';
import { AbstractPage } from '../../pages/AbstractPage';

const PAGE_NAME: string = 'ChatMessage';
const REFRESH_LIST_CASE = 'authen.listcase';

@Component({
  selector: 'chat-message',
  templateUrl: './ChatMessage.component.html',
})
export class ChatMessage extends AbstractPage implements OnInit {

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
  public fulfillCaseId: string = 'fulfillCaseId';
  @Input()
  public isConfirm: boolean = false;
  @Input()
  public isCaseConfirmed: boolean = false;
  @Input()
  public isCaseHasPost: boolean = false;
  @Input()
  public isBackArrow: boolean = false;
  @Output()
  public submit: EventEmitter<any> = new EventEmitter();
  @Output()
  public expand: EventEmitter<any> = new EventEmitter();
  @Output()
  public back: EventEmitter<any> = new EventEmitter();
  @Output()
  public clickPost: EventEmitter<any> = new EventEmitter();
  @Output()
  public createPost: EventEmitter<any> = new EventEmitter();
  @ViewChild('chatMessage', { static: false })
  public chatMessage: any;
  //
  private observManager: ObservableManager;
  private subscription: Subscription;
  private ref: ChangeDetectorRef;
  // Facade
  private chatRoomFacade: ChatRoomFacade;
  private assetFacade: AssetFacade;
  private chatFacade: ChatFacade;
  //
  public showImage: boolean = false;
  public isLoading: boolean = false;
  //
  public apiBaseURL = environment.apiBaseURL;
  public scrollWidth: number;
  public message: string = '';
  public messageDate: string = '';
  public senderType: string = '';
  public senderName: string = '';
  public senderImage: any;
  public status: any;
  public cloneMessage: any;

  constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog, observManager: ObservableManager,
    chatRoomFacade: ChatRoomFacade, assetFacade: AssetFacade, ref: ChangeDetectorRef, chatFacade: ChatFacade) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.authenManager = authenManager;
    this.observManager = observManager;
    this.chatRoomFacade = chatRoomFacade;
    this.assetFacade = assetFacade;
    this.chatFacade = chatFacade;
    this.ref = ref;

    this.showImage = false;
    this.isLoading = false;

    this.observManager.createSubject(REFRESH_LIST_CASE);
  }

  public ngOnInit(): void {
    for (let message of this.data) {
      this.status = message;
    }
    this.cloneMessage = JSON.parse(JSON.stringify(this.data)); 

    if (!this.isCaseConfirmed && !this.isCaseHasPost) {
      interval(30000).pipe(
        concatMap(() => {
          return this.chatRoomFacade.getChatMessages(this.chatRoomId, this.asPage); // this will be your http get request
        })
      ).subscribe(async (res) => {
        if (res.data !== null && res.data !== undefined) { 
          for (const data of res.data) {
            if (data.senderImage !== null && data.senderImage !== undefined && data.senderImage !== '') {
              this.assetFacade.getPathFile(data.senderImage).then((image: any) => {
                if (image.status === 1) {
                  if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                    data.senderImage = '';
                  } else {
                    data.senderImage = image.data;
                  }
                } else {
                  data.senderImage = '';
                }
              });
            }
          }
        }

        this.data = res.data;
        this.scrollChat();
      });
    }
  }

  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  isPageDirty(): boolean {
    // throw new Error('Method not implemented.');
    return false;
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    // throw new Error('Method not implemented.');
    return;
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    // throw new Error('Method not implemented.');
    return;
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => {
      this.getRoomChatMessage(this.chatRoomId, this.asPage);
    }, 1000);

    this.scrollChat();
  }

  public onChatSend(chatMessage: any) {
    if (chatMessage !== null && chatMessage !== undefined && chatMessage !== '') {
      let data = {};

      if (this.asPage !== null && this.asPage !== undefined && this.asPage !== '') {
        data = { message: chatMessage, asPageId: this.asPage };
      } else {
        data = { message: chatMessage };
      }

      this.sendChatMessage(this.chatRoomId, data);
    } else {
      return;
    }

    this.chatMessage.nativeElement.value = '';
  }

  public onFileSelected(event) {
    let files = event.target.files;

    if (files.length === 0) {
      return;
    }

    if (files) {
      for (let file of files) {
        let reader = new FileReader();

        reader.onload = (event: any) => {
          let data = {
            fileName: file.name,
            size: file.size,
            image: event.target.result,
            mimeType: file.type
          }
          this.genFiles(data);
        }
        reader.readAsDataURL(file);
      }
    }
  }

  public isLogin(): boolean {
    let user = this.authenManager.getCurrentUser();
    return user !== undefined && user !== null;
  }

  private genFiles(files: any): void {
    this.showImage = true;
    this.isLoading = true;

    const asset = new Asset();
    asset.mimeType = files.mimeType;
    asset.data = files.image.split(',')[1];
    asset.fileName = files.fileName;
    asset.size = files.size;
    asset.expirationDate = null;

    let result = { asset };

    this.sendChatMessage(this.chatRoomId, result);
  }

  private sendChatMessage(chatRoomId: string, data: any) {
    this.chatRoomFacade.sendChatMessage(chatRoomId, data).then((res) => {
      this.observManager.publish(REFRESH_LIST_CASE, this.fulfillCaseId);
      this.markRead(res.data.chatMessage.id, this.asPage);
      if (res.data && res.data.senderImage !== '' && res.data.senderImage !== null && res.data.senderImage !== undefined) {
        this.assetFacade.getPathFile(res.data.senderImage).then((image: any) => {
          if (image.status === 1) {
            if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
              res.data.senderImage = null;
            } else {
              res.data.senderImage = image.data;
            }
          }

        }).catch((err: any) => {
          if (err.error.message === "Unable got Asset") {
            res.data.senderImage = '';
          }
        });
        this.data.push(res.data);
      } else {
        this.data.push(res.data);
      }

      this.scrollChat();
    }).catch((error) => {
      console.log('error >>> ', error.message);
    });
  }

  private getRoomChatMessage(roomId: string, asPage?: string) {
    this.chatRoomFacade.getChatMessage(roomId, asPage).then((res) => {
      if (res.data && res.data.senderImage !== '' && res.data.senderImage !== null && res.data.senderImage !== undefined) {
        this.assetFacade.getPathFile(res.data.senderImage).then((image: any) => {
          if (image.status === 1) {
            if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
              res.data.senderImage = null;
            } else {
              res.data.senderImage = image.data;
            }
          }
        }).catch((err: any) => {
          if (err.error.message === "Unable got Asset") {
            res.data.senderImage = '';
          }
        });
        this.data.push(res.data);
      }
    }).catch((error) => {
      console.log('error >>> ', error);
    });
  }

  private scrollChat() {
    let talkingDom = document.getElementById("talking");

    if (talkingDom !== null && talkingDom !== undefined) {
      setTimeout(() => {
        talkingDom.scrollTop = talkingDom.scrollHeight;
      }, 1000);
    }
  }

  public async markRead(chatId, asPage) {
    let chatIds: string[] = [];
    chatIds.push(chatId);
    await this.chatFacade.markReadChatMessage(chatIds, asPage).then((readResult) => {
      if (readResult !== null && readResult !== undefined) {
        for (let chat of this.data) {
          for (let result of readResult.data) {
            if (chat.chatMessage.id === result.id) {
              chat.chatMessage.isRead = result.isRead
            }
          }
        }
      }
    }).catch((error) => {
      console.log('error >>>> ', error);
    });
  }
}
