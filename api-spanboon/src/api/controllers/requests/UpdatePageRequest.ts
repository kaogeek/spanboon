/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';

export class UpdatePageRequest {

    // @IsNotEmpty({ message: 'Pagename is required' })
    public name: string;
    public pageUsername: string;
    public subTitle: string;
    public backgroundStory: string;
    public detail: string;
    public imageAsset: any;
    public coverAsset: any;
    public coverPosition: number;
    public color: string;
    public category: string;
    public pageAccessLevel: number;
    public banned: boolean;
    public lineId: string;
    public facebookURL: string;
    public instagramURL: string;
    public websiteURL: string;
    public mobileNo: string;
    public twitterURL: string;
    public address: string;
    public email: string;
    public province:string;
    public group:string;
    public autoApprove:boolean;
}
