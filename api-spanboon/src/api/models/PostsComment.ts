/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Column, Entity, ObjectIdColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('PostsComment')
export class PostsComment extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'user' })
    public user: ObjectID;

    @Column({ name: 'post' })
    public post: string;

    @Column({ name: 'comment' })
    public comment: string;

    @Column({ name: 'mediaURL' })
    public mediaURL: string;

    @Column({ name: 'likeCount' })
    public likeCount: number;

    @Column({ name: 'commentAsPage' })
    public commentAsPage: ObjectID;

    @Column({ name: 'deleted' })
    public deleted: boolean;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().toDate();
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.updateDate = moment().toDate();
    }
}
