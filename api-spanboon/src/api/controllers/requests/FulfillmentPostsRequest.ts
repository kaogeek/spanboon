/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import 'reflect-metadata';

export class FulfillmentPostsRequest {

    public title: string;
    public detail: string;
    public story: any;
    public referenceMode: number;
    public isDraft: boolean;
    public postsHashTags: any;
    public userTags: any;
    public coverImage: any;
    public type: string;
    public needs: any[];
    public objective: string;
    public emergencyEvent: string;
    public postGallery: any[];
    public startDateTime: Date;
}