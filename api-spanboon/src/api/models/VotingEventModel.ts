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

@Entity('VotingEvent')
export class VotingEventModel extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'title' })
    public title: string;

    @Column({ name: 'detail' })
    public detail: string;

    @Column({ name: 'assetId' })
    public assetId: ObjectID;

    @Column({ name: 'coverPageURL' })
    public coverPageURL: string;

    @Column({ name: 's3CoverPageURL' })
    public s3CoverPageURL: string;

    @Column({ name: 'userId' })
    public userId: ObjectID;

    @Column({ name: 'approved' })
    public approved: boolean;

    @Column({ name: 'closed' })
    public closed: boolean;

    @Column({ name: 'min_support' })
    public min_support: number;

    @Column({ name: 'count_support' })
    public count_support: number;

    @Column({ name: 'start_vote_datetime' })
    public start_vote_datetime: Date;

    @Column({ name: 'end_vote_datetime' })
    public end_vote_datetime: Date;

    @Column({ name: 'approve_datetime' })
    public approve_datetime: Date;

    @Column({ name: 'approve_name' })
    public approve_name: string;

    @Column({ name: 'update_datetime' })
    public update_datetime: Date;

    @Column({ name: 'create_user' })
    public create_user: ObjectID;

    @Column({ name: 'status' })
    public status: any;

    @Column({ name: 'create_as_page' })
    public create_as_page: ObjectID;

    @Column({ name: 'type' })
    public type: any;

    @Column({ name: 'public' })
    public public: any;

    @Column({ name: 'pin' })
    public pin: boolean;

    @Column({ name: 'showed' })
    public showed: boolean;

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
