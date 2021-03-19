/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';

export class UserEngagementRequest {
 
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
