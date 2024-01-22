import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager } from 'src/app/services/AuthenManager.service';
import * as jsonData from '../../../.well-known/assetlinks.json';
import * as jsonDataIOS from '../../../.well-known/apple-app-site-association.json';
import { environment } from 'src/environments/environment';
import { AbstractPage } from './AbstractPage';
import { HttpClient } from '@angular/common/http';

const PAGE_NAME: string = '.well-known';
const PAGE_NAME_APPLE: string = '/apple-app-site-association.json';

@Component({
    selector: 'my-app',
    templateUrl: './AppleAppSite.component.html',
})
export class AppleAppSite extends AbstractPage implements OnInit {

    public static readonly PAGE_NAME: string = PAGE_NAME;
    public static readonly PAGE_NAME_APPLE: string = PAGE_NAME_APPLE;

    public respone: any;
    public isAndroid: boolean = false;
    android: any = jsonData;
    iOS: any = jsonDataIOS;
    constructor(
        router: Router,
        private http: HttpClient,
        authenManager: AuthenManager,
        dialog: MatDialog) {
        super(PAGE_NAME, authenManager, dialog, router);
        this.router = router;
        this.authenManager = authenManager;
        this.dialog = dialog;
    }

    ngOnInit(): void {
        const json = this.android.default;
        const newFingerprints = environment.sha256_cert_fingerprints;

        json[0].target.sha256_cert_fingerprints = newFingerprints;
        if (this.router.url === '/.well-known/apple-app-site-association.json') {
            // window.open(environment.apple_app_link);
            // this.router.navigateByUrl(environment.apple_app_link);
            // this.getAppleAppSiteAssociation();
        } else {
            this.isAndroid = true;
        }
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

    public getAppleAppSiteAssociation(): Promise<any> {
        return new Promise((resolve, reject) => {
            let url: string = environment.apiBaseURL + '/voting/.well-known/apple-app-site-association/';
            this.http.get(url).toPromise().then((response: any) => {
                this.respone = response;
            }).catch((error: any) => {
                reject(error);
            });
        });
    }
}
