import { Component, OnInit, ViewChild, ElementRef, HostBinding, Input, Optional, Self, ChangeDetectorRef, Output, EventEmitter, HostListener, ViewContainerRef } from '@angular/core';
import { AuthenManager, ProfileFacade, AssetFacade, ObservableManager, MenuContextualService, PostFacade, PageFacade, ObjectiveFacade } from '../services/services';
import { MatDialog } from '@angular/material/dialog';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatChipInputEvent } from '@angular/material';
import { TooltipProfile } from './components';
import { AbstractPageImageLoader } from './pages/AbstractPageImageLoader';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { environment } from '../../environments/environment';
import { SearchFilter } from 'src/app/models/SearchFilter';
import { DialogPostCrad } from '../../../src/app/components/shares/dialog/DialogPostCrad.component';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';

declare var atwho: any;
declare var $: any;

const PAGE_NAME: string = 'test';
export interface Fruit {
  name: string;
}

@Component({
  selector: 'test-component',
  templateUrl: './TestComponent.component.html',
})

export class TestComponent extends AbstractPageImageLoader implements OnInit {
  movies = [
    'Episode I - The Phantom Menace',
    'Episode II - Attack of the Clones',
    'Episode III - Revenge of the Sith',
    'Episode IV - A New Hope',
    'Episode V - The Empire Strikes Back',
    'Episode VI - Return of the Jedi',
    'Episode VII - The Force Awakens',
    'Episode VIII - The Last Jedi',
    'Episode IX – The Rise of Skywalker'
  ];
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  addOnBlur: boolean = true;

  public link = window.location

  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];

  keywords = [];
  assetFacade: AssetFacade;
  objectiveFacade: ObjectiveFacade;
  postFacade: PostFacade;
  pageFacade: PageFacade;

  public apiBaseURL = environment.apiBaseURL;

  public STORY: any;
  public recommendedHashtag: any;
  public recommendedStory: any;
  public recommendedStorys: any;
  public userCloneDatas: any;
  public pageUser: any;



  public messagelist: any[] = [];
  public messagelist2: any[] = [];
  public timeOut: boolean;
  public message: any = null;
  public slideNoti: boolean;

  public mockmessage4: object[] = [
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'แมวสวัดดีปีใหม่ และ ไก่สดCPส่งที่KFC ได้แชร์โพสต์ของ หมูหมักหลักสิบ', image: 'https://faithandbacon.com/wp-content/uploads/2019/11/animal-ape-banana-cute-321552-min-scaled.jpg', status: 'COMMENT', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ไก่จ๋าหนีข้าทำไม และ แมวตัวนี้สีดำ ได้แชร์โพสต์ของ หนูไงจะแมวไรละ', image: 'https://faithandbacon.com/wp-content/uploads/2019/11/animal-ape-banana-cute-321552-min-scaled.jpg', status: 'COMMENT', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ตู่อยู่ต่อไม่รอแล้วนะ ดูการเติบโตของเพจ พลังประชาชนคนจนทั้งประเทศ', image: 'https://faithandbacon.com/wp-content/uploads/2019/11/animal-ape-banana-cute-321552-min-scaled.jpg', status: 'COMMENT', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'Treerayuth และ TreeraHUT ส่งรูปภาพไปให้ Onraor', image: 'https://image.sistacafe.com/images/uploads/summary/image/86991/c0d2af28b7a4548d686cc7a01a38263f.jpg', status: 'LIKE', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ผักชีโลละ30 และ 30รักษาทุกโรค ถูกใจโพสต์ของ สวัดดีคนไทย', image: 'https://image.sistacafe.com/images/uploads/summary/image/86991/c0d2af28b7a4548d686cc7a01a38263f.jpg', status: 'LIKE', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'เสี่ยชัตสายชัก แสดงความคิดเห็นโพสต์ของ โอ๋นวลน้อง', image: 'https://image.sistacafe.com/images/uploads/summary/image/86991/c0d2af28b7a4548d686cc7a01a38263f.jpg', status: 'LIKE', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'แมวสวัดดีปีใหม่ และ ไก่สดCPส่งที่KFC ได้แชร์โพสต์ของ หมูหมักหลักสิบ', image: 'https://positioningmag.com/wp-content/uploads/2019/05/open_ais-1.jpg', status: 'repost', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ไก่จ๋าหนีข้าทำไม และ แมวตัวนี้สีดำ ได้แชร์โพสต์ของ หนูไงจะแมวไรละ', image: 'https://positioningmag.com/wp-content/uploads/2019/05/open_ais-1.jpg', status: 'repost', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ตู่อยู่ต่อไม่รอแล้วนะ ดูการเติบโตของเพจ พลังประชาชนคนจนทั้งประเทศ', image: 'https://positioningmag.com/wp-content/uploads/2019/05/open_ais-1.jpg', status: 'repost', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'Treerayuth และ TreeraHUT ส่งรูปภาพไปให้ Onraor', image: 'http://2.bp.blogspot.com/-EIvtDqptdvo/VMg93TF620I/AAAAAAAAMAg/K7cekcFlJys/w640/funnymonkey12108thinks.jpg', status: 'share', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ผักชีโลละ30 และ 30รักษาทุกโรค ถูกใจโพสต์ของ สวัดดีคนไทย', image: 'http://2.bp.blogspot.com/-EIvtDqptdvo/VMg93TF620I/AAAAAAAAMAg/K7cekcFlJys/w640/funnymonkey12108thinks.jpg', status: 'share', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'เสี่ยชัตสายชัก แสดงความคิดเห็นโพสต์ของ โอ๋นวลน้อง', image: 'http://2.bp.blogspot.com/-EIvtDqptdvo/VMg93TF620I/AAAAAAAAMAg/K7cekcFlJys/w640/funnymonkey12108thinks.jpg', status: 'share', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'แมวสวัดดีปีใหม่ และ ไก่สดCPส่งที่KFC ได้แชร์โพสต์ของ หมูหมักหลักสิบ', image: 'https://image.bangkokbiznews.com/uploads/images/md/2022/05/w3DH0pBZXO4yN75OYWBj.webp?x-image-process=style/MD', status: 'POST', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ไก่จ๋าหนีข้าทำไม และ แมวตัวนี้สีดำ ได้แชร์โพสต์ของ หนูไงจะแมวไรละ', image: 'https://image.bangkokbiznews.com/uploads/images/md/2022/05/w3DH0pBZXO4yN75OYWBj.webp?x-image-process=style/MD', status: 'POST', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ตู่อยู่ต่อไม่รอแล้วนะ ดูการเติบโตของเพจ พลังประชาชนคนจนทั้งประเทศ', image: 'https://image.bangkokbiznews.com/uploads/images/md/2022/05/w3DH0pBZXO4yN75OYWBj.webp?x-image-process=style/MD', status: 'POST', isRred: false } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'Treerayuth และ TreeraHUT ส่งรูปภาพไปให้ Onraor', image: 'https://static.posttoday.com/media/content/2019/09/05/1F4A465E09344344A3CA7241645E4FB4.jpg', status: 'fullfill', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'ผักชีโลละ30 และ 30รักษาทุกโรค ถูกใจโพสต์ของ สวัดดีคนไทย', image: 'https://static.posttoday.com/media/content/2019/09/05/1F4A465E09344344A3CA7241645E4FB4.jpg', status: 'fullfill', isRred: true } },
    { notification: { title: 'การแจ้งเตือนใหม่', body: 'เสี่ยชัตสายชัก แสดงความคิดเห็นโพสต์ของ โอ๋นวลน้อง', image: 'https://static.posttoday.com/media/content/2019/09/05/1F4A465E09344344A3CA7241645E4FB4.jpg', status: 'fullfill', isRred: false } },
  ]

  public static readonly PAGE_NAME: string = PAGE_NAME;
  constructor(router: Router, authenManager: AuthenManager, objectiveFacade: ObjectiveFacade, profileFacade: ProfileFacade, dialog: MatDialog,
    sanitizer: DomSanitizer, assetFacade: AssetFacade, pageFacade: PageFacade, observManager: ObservableManager, postFacade: PostFacade, private popupService: MenuContextualService, private viewContainerRef: ViewContainerRef) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.assetFacade = assetFacade
    this.pageFacade = pageFacade
    this.objectiveFacade = objectiveFacade;
    this.postFacade = postFacade;



    // let user = this.authenManager.getCurrentUser()
    // this.userCloneDatas = JSON.parse(JSON.stringify(user));
    // if (this.userCloneDatas !== undefined && this.userCloneDatas !== null) {
    //   this.searchPageInUser(this.userCloneDatas.id);
    // } else {
    //   this.searchPageInUser();
    // }
    // let search: SearchFilter = new SearchFilter();
    // search.limit = 5;
    // search.count = false;
    // search.whereConditions = { _id: '6128b4d7949e111314c2a648' };
    // this.postFacade.searchPostStory(search).then(async (res: any) => {
    //   this.STORY = res;
    //   this.TimeoutRuntimeSet();
    //   this.getRecommendedHashtag(this.STORY[0]._id);
    //   this.getRecommendedStory(this.STORY[0]._id);
    //   this.getRecommendedStorys(this.STORY[0]._id, this.STORY[0].pageId);
    // }).catch((err: any) => {
    //   console.log(err)
    // })




  }
  ngOnInit(): void {
    for (let index = 0; index < 4; index++) {
      this.setData();
    }
  }

  public TimeoutRuntimeSet() {
    setTimeout(() => {
      $('.comSelect').remove();
      $('.comDelet').remove();
    }, 400);
  }


  public getRecommendedHashtag(id: string) {
    this.postFacade.recommendedHashtag(id).then((res: any) => {
      this.recommendedHashtag = res.data
    }).catch((err: any) => {
    })
  }

  public getRecommendedStory(id: string) {
    this.postFacade.recommendedStory(id).then((res: any) => {
      this.recommendedStory = res.data
    }).catch((err: any) => {
    })
  }

  public getRecommendedStorys(id: string, pageId: string) {
    this.postFacade.recommendedStorys(id, pageId).then((res: any) => {
      this.recommendedStorys = res.data
    }).catch((err: any) => {
    })
  }

  public clickToPage(dataId: any, type?: any) {
    if (type !== null && type !== undefined) {
      this.router.navigate([]).then(() => {
        window.open('/search?hashtag=' + dataId, '_blank');
      });
    } else {
      if (typeof (dataId) === 'object') {
        const dialogRef = this.dialog.open(DialogPostCrad, {
          width: 'auto',
          disableClose: false,
          data: {
            post: dataId,
            isNotAccess: false,
            user: this.userCloneDatas,
            pageUser: this.pageUser,
          }
        });
        dialogRef.afterClosed().subscribe(result => {
        });
      } else {
        this.router.navigate([]).then(() => {
          window.open('/emergencyevent/' + dataId);
        });
      }
    }
  }

  public async searchPageInUser(userId?) {
    if (userId) {
      let search: SearchFilter = new SearchFilter();
      search.limit = 2;
      search.count = false;
      search.whereConditions = { ownerUser: userId };
      var aw = await this.pageFacade.search(search).then((pages: any) => {
        this.pageUser = pages
        this.pageUser.push(this.userCloneDatas)
        this.pageUser.reverse();
      }).catch((err: any) => {
      });
      if (this.pageUser.length > 0) {
        for (let p of this.pageUser) {
          var aw = await this.assetFacade.getPathFile(p.imageURL).then((res: any) => {
            p.img64 = res.data
          }).catch((err: any) => {
          });
        }
      }
    }

  }




  public ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  public yes_js_login = function () {
    $('.toolbar a').click(function (e) {
      var command = $(this).data('command');
      if (command == 'h1' || command == 'h2' || command == 'p') {
        document.execCommand('formatBlock', false, command);
      }
      if (command == 'forecolor' || command == 'backcolor') {
        document.execCommand($(this).data('command'), false, $(this).data('value'));
      }
      if (command == 'createlink' || command == 'insertimage') {
        let url = prompt('www.google.com', 'http:\/\/'); document.execCommand($(this).data('command'), false, url);
      }
      else document.execCommand($(this).data('command'), false, null);
    });
    return false;
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.movies, event.previousIndex, event.currentIndex);
  }

  add(event: MatChipInputEvent): void {
    let input = event.input;
    let value = event.value;

    // Add our keyword
    if ((value || '').trim()) {
      this.keywords.push(value.trim());
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(keyword: any): void {
    let index = this.keywords.indexOf(keyword);

    if (index >= 0) {
      this.keywords.splice(index, 1);
    }
  }
  public onClickTest(origin: any) {
    this.popupService.open(origin, TooltipProfile, this.viewContainerRef, {
      name: "I'm the button " + 1,
      obj: 's'
    })
      .subscribe(res => {
      });
  }

  public getImageSelector(): string[] {
    return [".checkload"];
  }


  public setData() {
    this.messagelist.push(this.mockmessage4[Math.floor(Math.random() * this.mockmessage4.length)]);
    this.messagelist2.push(this.mockmessage4[Math.floor(Math.random() * this.mockmessage4.length)]);
  }

  public onSelectorImageElementLoaded(imageElement: any[]): void {

  }

  public onImageElementLoadOK(imageElement: any): void {

  }

  public onImageElementLoadError(imageElement: any): void {

  }

  public onImageLoaded(imageElement: any[]): void {
  }

}
