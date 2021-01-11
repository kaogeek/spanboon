/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { ObjectID } from 'mongodb';
import { User } from '../../models/User';
import { Posts } from '../../models/Posts';

export class ContentModelResponse {
    
    public id: ObjectID;
    public title: string;
    public subtitle: string;
    public description: string;
    public iconUrl: string;
    public commentCount: number;
    public rePostCount: number;
    public shareCount: number;
    public likeCount: number;
    public viewCount: number;
    public link: string;
    public owner: string;
    public dateTime: Date;
    public fullfillUsers: User[];
    public fullfillUserCount: number;
    public followUserCount: number;
    public followUsers: User[];
    public postPage: Posts[];
}
