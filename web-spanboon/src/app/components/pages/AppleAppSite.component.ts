import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager } from 'src/app/services/AuthenManager.service';
import * as jsonData from '../../../.well-known/assetlinks.json';
import { environment } from 'src/environments/environment';
import { AbstractPage } from './AbstractPage';

const PAGE_NAME: string = '.well-known';
const PAGE_NAME_APPLE: string = '/apple-app-site-association';

@Component({
    selector: 'my-app',
    templateUrl: './AppleAppSite.component.html',
})
export class AppleAppSite extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;
    public static readonly PAGE_NAME_APPLE: string = PAGE_NAME_APPLE;

    data: any = jsonData;
    constructor(
        router: Router,
        authenManager: AuthenManager,
        dialog: MatDialog) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.dialog = dialog;

        const json = this.data.default;
        const newFingerprints = environment.sha256_cert_fingerprints;

        json[0].target.sha256_cert_fingerprints = newFingerprints;
        if (this.router.url === '/.well-known/apple-app-site-association') {
            window.open(environment.apple_app_link);
            this.router.navigateByUrl('/home');
        }
    }

    ngOnInit(): void {
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
