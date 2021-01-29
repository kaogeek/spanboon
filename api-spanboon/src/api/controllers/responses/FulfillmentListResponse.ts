/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export class FulfillmentListResponse {

    public fulfillCaseId: string;
    public userId: string;
    public uniqueId: string;
    public pageId: string;
    public pageName: string;
    public pageUsername: string;
    public postId: string;
    public fulfillmentPost: string;
    public postDate: Date;
    public description: string;
    public pageImageURL: string;
    public userImageURL: string;
    public title: string;
    public fulfillRequestCount: number;
    public emergencyEvent: any;
    public objective: any;
    public name: string;
    public chatRoom: string;
    public chatMessage: string;
    public chatDate: Date;
    public chatSender: any; // {name: string, id: string, imageURL: string, type: string}
    public isRead: boolean;
    public status: string;
    public createdDate: Date;
    public updateDate: Date;
    public updatedByPageDate: Date;
    public updatedByUserDate: Date;
    public approveDateTime: Date;
    public unreadMessageCount: number;
}