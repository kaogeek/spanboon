import { Component, EventEmitter, OnInit } from '@angular/core';
import { AuthenManager } from '../../../services/AuthenManager.service';
import { MatDialog } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AbstractPageImageLoader } from '../AbstractPageImageLoader';
import { Platform } from '@angular/cdk/platform';
import { DeviceDetectorService } from 'ngx-device-detector';

const PAGE_NAME: string = 'on-process';

@Component({
  selector: 'processing-page',
  templateUrl: './ProcessingPage.component.html',
})
export class ProcessingPage extends AbstractPageImageLoader implements OnInit {
  deviceInfo = null;
  public static readonly PAGE_NAME: string = PAGE_NAME;
  public route: ActivatedRoute;

  public data: any;

  public isLoading: boolean = true;
  constructor(
    router: Router,
    dialog: MatDialog,
    authenManager: AuthenManager,
    public platform: Platform,
    private deviceService: DeviceDetectorService,) {
    super(PAGE_NAME, authenManager, dialog, router);
  }

  public ngOnInit(): void {
    let platform;
    if (this.platform.IOS) platform = 'ios';
    if (this.platform.ANDROID) platform = 'android';
    this.deviceInfo = this.deviceService.getDeviceInfo();
    if (platform === 'ios' || this.deviceInfo.os === 'Mac') {
      window.location.href = 'https://apps.apple.com/us/app/mfp-today/id6444463783';
    } else {
      window.location.href = 'https://play.google.com/store/search?q=mfp+today&c=apps';
    }
  }

  public ngOnDestroy(): void {
  }

  public getImageSelector(): string[] {
    throw new Error('Method not implemented.');
  }
  public onSelectorImageElementLoaded(imageElement: any[]): void {
    throw new Error('Method not implemented.');
  }
  public onImageElementLoadOK(imageElement: any): void {
    throw new Error('Method not implemented.');
  }
  public onImageElementLoadError(imageElement: any): void {
    throw new Error('Method not implemented.');
  }
  public onImageLoaded(imageElement: any[]): void {
    throw new Error('Method not implemented.');
  }
  isPageDirty(): boolean {
    throw new Error('Method not implemented.');
  }
  onDirtyDialogConfirmBtnClick(): EventEmitter<any> {
    throw new Error('Method not implemented.');
  }
  onDirtyDialogCancelButtonClick(): EventEmitter<any> {
    throw new Error('Method not implemented.');
  }
}