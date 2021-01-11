/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { BaseModel } from './BaseModel';

export class FulfillmentCase extends BaseModel {

    public id: string;
    public status: string;
    public pageId: string;
    public postId: string;
    public description: string;
    public approveUser: string;
    public approveDateTime: Date;
    public requester: string;
}
