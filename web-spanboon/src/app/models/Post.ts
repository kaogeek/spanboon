/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { BaseModel } from "./BaseModel"

export class Post extends BaseModel {

    public id: string;
    public title: string;
    public detail: string;
    public story: string;
    public isDraft: boolean;
    public pinned: boolean;
    public deleted: boolean;
    public hidden: boolean;
    public type: string;
    public referencePost: string;
    public rootReferencePost: string;
    public referenceMode: number;
    public commentCount: number;
    public repostCount: number;
    public shareCount: number;
    public likeCount: number;
    public viewCount: number;
    public coverImage: string;
    public postsHashTags: any[];
    public objective: string;
    public emergencyEvent: string;
    public objectiveTag: string;
    public emergencyEventTag: string;
    public userTags: any[];
    public startDateTime: Date;
    public postAsPage: string;
    public visibility: string;
    public ranges: string[];
    public feedReachCount: number;
    public linkReachCount: number;
    public reachCount: number;
}
