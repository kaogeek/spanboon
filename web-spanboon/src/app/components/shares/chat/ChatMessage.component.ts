/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>, Chanachai-Pansailom <chanachai.p@absolute.co.th>, Americaso <treerayuth.o@absolute.co.th>
 */

import { Output, ViewContainerRef } from '@angular/core';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { interval, Observable, Subject, Subscription, timer,BehaviorSubject } from 'rxjs';
import { concatMap } from 'rxjs/operators';
import { FULFILLMENT_STATUS } from '../../../FulfillmentStatus';
import { Asset } from '../../../models/models';
import { AssetFacade, AuthenManager, ChatFacade, ChatRoomFacade, MenuContextualService, ObservableManager } from '../../../services/services';
import { ValidBase64ImageUtil } from '../../../utils/ValidBase64ImageUtil';
import { environment } from '../../../../environments/environment';
import { AbstractPage } from '../../pages/AbstractPage';
import { TooltipProfile } from '../tooltip/TooltipProfile.component';
import Glightbox from 'glightbox';
import { io } from "socket.io-client";

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
  @Input()
  public isAsPage: boolean = false;
  @Input()
  public ProfilePage: any;
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
  public ganY: any;
  public ganX: any;
  public message$: BehaviorSubject<string> = new BehaviorSubject('');

  constructor(authenManager: AuthenManager, router: Router, dialog: MatDialog, observManager: ObservableManager,
    chatRoomFacade: ChatRoomFacade, assetFacade: AssetFacade, private popupService: MenuContextualService, private viewContainerRef: ViewContainerRef, ref: ChangeDetectorRef, chatFacade: ChatFacade) {
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
  socket = io('http://localhost:9000/api');

  public ngOnInit(): void {
    for (let message of this.data) {
      this.status = message;
    }
    this.cloneMessage = JSON.parse(JSON.stringify(this.data));
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
    this.getChatObserv();
    setTimeout(() => {
      this.getRoomChatMessage(this.chatRoomId, this.asPage);
    }, 1000);

    this.scrollChat();
  }

  // user get room 

  // get online client on chat room socket io
  public getChatObserv() {
    if (!this.isCaseConfirmed && !this.isCaseHasPost) {
      this.observManager.subscribe('chat_message', (roomId: any) => {
        // this will be your http get request 
        this.chatRoomFacade.getChatMessages(roomId, this.asPage).subscribe(async (res) => {
          
            if (res.data !== null && res.data !== undefined) {
              for (let newMessage of res.data) {
                var isMessage = false;
                for (let message of this.cloneMessage) {
                  if (newMessage.chatMessage.id === message.chatMessage.id) {
                    isMessage = true;
                    break;
                  }
                }
                if (!isMessage) {
                  this.markRead(newMessage.chatMessage.id, this.asPage);
                  if (newMessage.senderImage !== null && newMessage.senderImage !== undefined && newMessage.senderImage !== '') {
                    this.assetFacade.getPathFile(newMessage.senderImage).then((image: any) => {
                      if (image.status === 1) {
                        if (!ValidBase64ImageUtil.validBase64Image(image.data)) {
                          newMessage.senderImage = '';
                        } else {
                          newMessage.senderImage = image.data;
                        }
                      } else {
                        newMessage.senderImage = '';
                      }
                    });
                  }
                  this.data.push(newMessage);
                  this.cloneMessage = JSON.parse(JSON.stringify(this.data));
                }
              }
              this.scrollChat();
            }
            
        });
      });
    }
  }

  // send message 

  // already to send message with socket io
  public onChatSend(chatMessage: any) {
    if (chatMessage !== null && chatMessage !== undefined && chatMessage !== '') {
      let data = {};

      if (this.asPage !== null && this.asPage !== undefined && this.asPage !== '') {
        data = { message: chatMessage, asPageId: this.asPage };
      } else {
        data = { message: chatMessage };
      }

    } else {
      return;
    }

    this.chatMessage.nativeElement.value = '';
  }

  public showDialogGallery(imageGallery) {
    var lightbox = Glightbox();
    let arrayImage = []
    arrayImage.push({
      href: imageGallery,
      type: 'image' // Type is only required if GlIghtbox fails to know what kind of content should display
    })

    lightbox.setElements(arrayImage);
    lightbox.openAt(0);
    lightbox.on('open', (target) => {
    });
    lightbox.on('close', (target) => {
      lightbox.destroy();
    });
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
      this.cloneMessage = JSON.parse(JSON.stringify(this.data));

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

  onMouseEnter(event: MouseEvent, outerDiv: HTMLElement) {
    const bounds = outerDiv.getBoundingClientRect();
    this.ganX = (event.clientX - bounds.left + 'px');
    this.ganY = (event.clientY - bounds.top + 'px');
  }

  public Tooltip(origin: any, data) {
    if (!this.isAsPage) {
      data.owner = Object.assign(data.owner, { type: "USER" });
    } else {
      data.owner = Object.assign(data.owner, { type: "PAGE" });
    }
    this.popupService.open(origin, TooltipProfile, this.viewContainerRef, {
      data: data,
    })
      .subscribe(res => {
      });
  }


  public TooltipClose($event) {

    setTimeout(() => {

      if ($event.toElement.className !== "ng-star-inserted") {
        this.popupService.close(null);
      }

    }, 400);
  }

}
