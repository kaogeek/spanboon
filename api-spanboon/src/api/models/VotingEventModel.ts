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

    @Column({ name: 'minSupport' })
    public minSupport: number;

    @Column({ name: 'countSupport'})
    public countSupport: number;

    @Column({ name: 'voteDaysRange'})
    public voteDaysRange: number;

    @Column({ name: 'startVoteDatetime'})
    public startVoteDatetime: Date;

    @Column({ name: 'endVoteDatetime' })
    public endVoteDatetime: Date;

    @Column({ name: 'supportDaysRange' })
    public supportDaysRange: number;

    @Column({ name: 'startSupportDatetime'})
    public startSupportDatetime: Date;

    @Column({ name: 'endSupportDatetime'})
    public endSupportDatetime: Date;

    @Column({ name: 'approveDatetime' })
    public approveDatetime: Date;

    @Column({ name: 'closeDate' })
    public closeDate: Date;

    @Column({ name: 'approveUsername' })
    public approveUsername: string;

    @Column({ name: 'updateDatetime' })
    public updateDatetime: Date;

    @Column({ name: 'status' })
    public status: any;

    @Column({ name: 'createAsPage' })
    public createAsPage: ObjectID;

    @Column({ name: 'type' })
    public type: any;

    @Column({ name: 'hashTag' })
    public hashTag: ObjectID;

    @Column({ name: 'pin' })
    public pin: boolean;

    @Column({ name: 'showVoterName' })
    public showVoterName: boolean;

    @Column({ name: 'showVoteResult' })
    public showVoteResult: boolean;

    @Column({ name: 'service' })
    public service: string;

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
