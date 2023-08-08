import { Component } from '@angular/core';
import * as jsonData from '../../../.well-known/assetlinks.json';

const PAGE_NAME: string = '.well-known';
const PAGE_NAME_APPLE: string = 'assetlinks.json';

@Component({
    selector: 'my-app',
    templateUrl: './AppleAppSite.component.html',
})
export class AppleAppSite {

    public static readonly PAGE_NAME: string = PAGE_NAME;
    public static readonly PAGE_NAME_APPLE: string = PAGE_NAME_APPLE;

    data: any = jsonData;
    constructor() {
    }

    ngOnInit(): void {
        console.log("data", this.data)
    }
}
