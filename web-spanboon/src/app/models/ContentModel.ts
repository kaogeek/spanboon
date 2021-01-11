/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { BaseModel } from "./BaseModel"
import { User } from './User';

export class ContentModel extends BaseModel{
    public title: string;
    public description: Text;
    public subtitle: string;
    public iconURL: string;
    public linkrePostCount: number;
    public shareCount: number;
    public likeCount: number;
    public viewCount: number;
    public contentCount: number;
    public link: string;
    public owner: string;
    public dateTime: Date;
    public fulfillUsers: User[];
    public fulfillUserCount: number;
    public followUserCount: number;
    public followUsers: User[];
    // public post: string;
}
