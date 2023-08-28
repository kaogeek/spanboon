/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn, Index } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('Posts')
export class Posts extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'detail' })
    @Index()
    public detail: string;

    @Column({ name: 'story' })
    @Index()
    public story: any;

    @Column({ name: 'isDraft' })
    public isDraft: boolean;

    @Column({ name: 'pinned' })
    public pinned: boolean;

    @Column({ name: 'deleted' })
    public deleted: boolean;

    @Column({ name: 'hidden' })
    public hidden: boolean;

    @Column({ name: 'type' })
    public type: string;

    @Column({ name: 'ownerUser' })
    public ownerUser: ObjectID;

    @Column({ name: 'referencePost' })
    public referencePost: ObjectID;

    @Column({ name: 'rootReferencePost' })
    public rootReferencePost: ObjectID;

    @Column({ name: 'referenceMode' })
    public referenceMode: number;

    @Column({ name: 'commentCount' })
    public commentCount: number;

    @Column({ name: 'repostCount' })
    public repostCount: number;

    @Column({ name: 'shareCount' })
    public shareCount: number;

    @Column({ name: 'likeCount' })
    public likeCount: number;

    @Column({ name: 'viewCount' })
    public viewCount: number;

    @Column({ name: 'coverImage' })
    public coverImage: string;

    @Column({ name: 's3CoverImage' })
    public s3CoverImage: string;

    @Column({ name: 'postsHashTags' })
    public postsHashTags: any[];

    @Column({ name: 'objective' })
    public objective: ObjectID;
    
    @Column({name: 'commentCountFB' })
    public commentCountFB:number;

    @Column({name: 'shareCountFB'})
    public shareCountFB:number;

    @Column({ name: 'likeCountFB'})
    public likeCountFB:number;

    @Column({ name: 'summationScore'})
    public summationScore:number;

    @Column({ name: 'newsFlag'})
    public newsFlag:boolean;

    @Column({ name: 'emergencyEvent' })
    public emergencyEvent: ObjectID;

    @Column({ name: 'objectiveTag' })
    public objectiveTag: string;

    @Column({ name: 'emergencyEventTag' })
    public emergencyEventTag: string;

    @Column({ name: 'userTags' })
    public userTags: any[];

    @Column({ name: 'startDateTime' })
    public startDateTime: Date;

    @Column({ name: 'postAsPage' })
    public postAsPage: ObjectID;

    @Column({ name: 'visibility' })
    public visibility: string;

    @Column({ name: 'ranges' })
    public ranges: string[];

    @Column({ name: 'feedReachCount' })
    public feedReachCount: number;

    @Column({ name: 'linkReachCount' })
    public linkReachCount: number;

    @Column({ name: 'reachCount' })
    public reachCount: number;

    @Column({ name: 'banned' })
    public banned: boolean;

    @BeforeInsert()
    public createDetails(): any {
        this.createdDate = moment().toDate();
        this.createdTime = moment().toDate();
    }

    @BeforeUpdate()
    public updateDetails(): any {
        this.updateDate = moment().toDate();
    }
}
