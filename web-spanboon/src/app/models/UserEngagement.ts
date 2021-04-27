/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { BaseModel } from './BaseModel';

export class UserEngagement extends BaseModel {
    
    public contentId: string;
    public contentType: string;
    public ip: string;
    public userId: string;
    public clientId: string;
    public isFirst: boolean;
    public action: string;  
    public reference: string;  
    public likeAsPage: number;  
}
