/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

export class PageObjectiveTimelineResponse {
    public page: any;
    public pageObjective: any;
    public relatedHashTags: any[];
    public followedUser: any[];
    public followedCount: number;
    public fulfillmentCount: number;
    public fulfillmentUserCount: number;
    public fulfillmentUser: any[];
    public isFollow: boolean;
    public startDateTime: Date;
    public endDateTime: Date;
    public timelines: any[];
    public needItems: any[];
}