/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { SearchRequest } from './SearchRequest';
import { SORT_SEARCH_TYPE } from '../../../constants/SearchType';

export class ContentSearchRequest extends SearchRequest {
    public hashtag: string[];
    public onlyFollowed: boolean;
    public isOfficial: boolean;
    public type: string;
    public createBy: any[]; // {id,type}
    public objective: string; // hashTag
    public emergencyEvent: string; // id
    public emergencyEventTag:string;
    public startDate: string;
    public endDate: string;
    public startViewCount: number;
    public endViewCount: number;
    // Count All Action
    public startActionCount: number;
    public endActionCount: number;
    // Count Comment
    public startCommentCount: number;
    public endCommentCount: number;
    // Count Repost
    public startRepostCount: number;
    public endRepostCount: number;
    // Count Like
    public startLikeCount: number;
    public endLikeCount: number;
    // Count Share
    public startShareCount: number;
    public endShareCount: number;
    // Location
    public locations: string[];
    // Page Catgory
    public pageCategories: string[];
    public sortBy: SORT_SEARCH_TYPE;
}
