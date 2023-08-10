import { Component, EventEmitter, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenManager } from 'src/app/services/AuthenManager.service';
import { ObservableManager } from 'src/app/services/ObservableManager.service';
import * as jsonData from '../../../.well-known/assetlinks.json';
import { environment } from 'src/environments/environment';
import { AbstractPage } from './AbstractPage';

const PAGE_NAME: string = '.well-known';
const PAGE_NAME_APPLE: string = 'assetlinks.json';

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
        // if (this.router.url === '/.well-known') {
        //     window.open('https://testuploadfilesz.s3.ap-southeast-1.amazonaws.com/1_lgZkB5FIZEqR6v-h_ZpCNw.png?response-content-disposition=inline&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEPn%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaDmFwLXNvdXRoZWFzdC0xIkYwRAIgFZvEl462NJLh58287VSVHM3o6ObCi1SLjSLu3qfSuksCICXImUQeTXC%2F%2FpDrkJUruX11lPc45DoRHBkEd%2BLWmBJoKvECCKL%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEQARoMNjcwMzA2MzY1MjQ5Igyx%2FxajR5VeF1YIGNoqxQIcbY5coR3z9Cis5zHrA6yrJ6ST7KoQCKbCDo3zR86t5KL222DsWaWOzgTtNnmcLPqO1YM38QDaJGMRQ3WFlUWm4TIqQ4vXkcEDLFx5o%2F3frPI5v2FYifkUCe2UYNrx%2B3irnCteomTIVgaPfesGxDT0eJ1Anl7ZrSR4JPPMYNZfp4yMBucl5YEZtOerGs5d5aqsAnHc31sy7%2FW1KwrPjsuTENB72Dc9i1mn9eLt64XktozmKfxLZKqdRKgYuMf2jbBe7kbJ7c512AaghWzEKmpEpwZFiGwXl9llVsjZvjpP4jQ8DtatknVIj%2F8PB0ZjJ7962at8HaXHK9bMjtJ71rmJ9LmVnwafhtv%2BThq5ocPnuosAMgQ4PzJvEbtLTLA2befCpXi8jbr3ZKTzOxBetuvYTgDcR%2ByTrBIwvjmXGrfN8h0YyojWMJivzaYGOrQCXvZ%2F6D%2Feoiv9bWWH4U%2FTUirY1T9uFbeQEnfwTVrmoJbJ3oJIkEhuYTeOzmMy6ACnATN74GjgN7BVOioLU6qdzCb8%2FomYqU5kbVbmnf1o3cnNTQU75TaWtpQik2EH%2BVZXU%2BhFvGaPlRt11S4hg%2FaFYq0o3Nb%2BURTnrfdw%2FBTGkGCxFfbLJ9a12oqpXuthB3bhurKi6X%2F37Egm6Q3whA4jo%2BHGESda0SwLlcoLXOuT7rZoCWIaj1MYinMMv2Bn%2BIFmxjv0%2FP9q5UFn5drajAGqXF%2BdmnGPgNOUbEuhKYRRowOz9CV8CaejTMI741L1hc%2FM%2FqZuDFw3nWOk0K27rGU988sDllNbVEn5%2BVIpM6MS77XozGfMP0FtBR8ERH0uPfkOmQNPWw062KtXrEnpw6Lo7XKu4U8%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20230809T092732Z&X-Amz-SignedHeaders=host&X-Amz-Expires=300&X-Amz-Credential=ASIAZYEK7N5AVEAVYMEB%2F20230809%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Signature=91242e53816bcec2795ac05fd22cc85ca087f743854f2131bedecbbdc0daa1fd');
        //     this.router.navigateByUrl('/home');
        // }
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
