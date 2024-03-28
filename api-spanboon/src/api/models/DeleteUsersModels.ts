/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { ObjectID } from 'mongodb';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('DeleteUser')
export class DeleteUserModel extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'delete'})
    public delete: boolean;

    @Column({ name: 'posts'})
    public posts: boolean;

    @Column({ name: 'postsComment'})
    public postsComment: boolean;

    @Column({ name: 'userLike'})
    public userLike: boolean;

    @Column({ name: 'socialPostLogs'})
    public socialPostLogs: boolean;

    @Column({ name: 'socialPost'})
    public socialPost: boolean;

    @Column({ name: 'pageSocialAccount'})
    public pageSocialAccount: boolean;

    @Column({ name: 'pageAccessLevel'})
    public pageAccessLevel: boolean;

    @Column({ name: 'pageAbout'})
    public pageAbout: boolean;

    @Column({ name: 'pageConfig'})
    public pageConfig: boolean;

    @Column({ name: 'pageObjective'})
    public pageObjective: boolean;

    @Column({ name: 'pageObjectiveJoiner'})
    public pageObjectiveJoiner: boolean;

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
