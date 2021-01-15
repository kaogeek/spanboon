import { Component, OnInit, ViewChild, ElementRef, HostBinding, Input, Optional, Self, ChangeDetectorRef, Output, EventEmitter, HostListener, ViewContainerRef } from '@angular/core';
import { AuthenManager, ProfileFacade, AssetFacade, ObservableManager, MenuContextualService } from '../services/services';
import { MatDialog } from '@angular/material/dialog';
import { ENTER, COMMA } from '@angular/cdk/keycodes';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MatChipInputEvent } from '@angular/material';
import { TooltipProfile } from './components';
import { AbstractPageImageLoader } from './pages/AbstractPageImageLoader';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

declare var atwho: any;
declare var $: any;

const PAGE_NAME: string = 'createpage-tester';
export interface Fruit {
  name: string;
}

@Component({
  selector: 'register-page-test',
  templateUrl: './RegisterPageTestComponent.component.html',
})

export class RegisterPageTestComponent extends AbstractPageImageLoader implements OnInit {
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

  private password: String = "@spanboon9173";
  public aut: boolean = true;

  public link = window.location
  public testpassword: any

  // Enter, comma
  separatorKeysCodes = [ENTER, COMMA];

  keywords = [];
  assetFacade: AssetFacade

  public static readonly PAGE_NAME: string = PAGE_NAME;
  constructor(router: Router, authenManager: AuthenManager, profileFacade: ProfileFacade, dialog: MatDialog,
    sanitizer: DomSanitizer, assetFacade: AssetFacade, observManager: ObservableManager, private popupService: MenuContextualService, private viewContainerRef: ViewContainerRef) {
    super(PAGE_NAME, authenManager, dialog, router);
    this.assetFacade = assetFacade

  }
  ngOnInit(): void {
    console.log('this.isLogin()', this.isLogin())
    if (!this.isLogin()) {
      this.showAlertLoginDialog("/createpage-tester");
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

  public onSelectorImageElementLoaded(imageElement: any[]): void {

  }

  public onImageElementLoadOK(imageElement: any): void {

  }

  public onImageElementLoadError(imageElement: any): void {

  }

  public onImageLoaded(imageElement: any[]): void {
  }

  public login() {
    if (this.password === this.testpassword) {
      this.aut = false;
    } else {
      this.showAlertDevelopDialog("รหัสเข้าทดสอบไม่ถูดต้องกรุณาติดต่อเจ้าหน้าที่เพื่อขอรับรหัสทดสอบ")
      this.testpassword = null
    }
  }

}
