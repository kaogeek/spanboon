/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { User } from './User';

export class ContentModel {
    public title: string;
    public subtitle: string;
    public description: string;
    public link: string;
    public contents: any[];
    public iconUrl: string;
    public iconSignUrl: string;
    public dateTime: Date;
    public templateType: string;
    public postCount: number;
    public commentCount: number;
    public twitterCount: number;
    public facebookCount: number;
    public likeCount: number;
    public shareCount: number;
    public viewCount: number;
    public repostCount: number;
    public post: any;
    public fulfillUsers: User[];
    public followUsers: User[];
    public coverPageUrl: string;
    public coverPageSignUrl: string;
    public followUserCount: number;
    public owner: any; // id, uniqueId, iconImage, isOfficial
    public isLike: boolean;
    public isRepost: boolean;
    public isComment: boolean;
    public isShare: boolean;
    public isFollow: boolean;
    public rootReferencePost: any;
    public data: any;
}