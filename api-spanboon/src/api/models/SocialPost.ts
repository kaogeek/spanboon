/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Entity, ObjectIdColumn, Column, BeforeInsert, BeforeUpdate } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment = require('moment');

@Entity('SocialPost')
export class SocialPost extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @IsNotEmpty()
    @Column({ name: 'postId' })
    public postId: ObjectID;

    /* if no page id that mean user post */
    @Column({ name: 'pageId' })
    public pageId: ObjectID;

    @Column({ name: 'socialType' })
    public socialType: string;

    @Column({ name: 'socialId' })
    public socialId: string;

    @Column({ name: 'postBy' })
    public postBy: ObjectID;

    @Column({ name: 'postByType' })
    public postByType: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().toDate();
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.updateDate = moment().toDate();
    }
}