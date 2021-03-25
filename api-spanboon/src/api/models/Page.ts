/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('Page')
export class Page extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'name' })
    public name: string;

    @Column({ name: 'pageUsername' })
    public pageUsername: string;

    @Column({ name: 'subTitle' })
    public subTitle: string;

    @Column({ name: 'backgroundStory' })
    public backgroundStory: string;

    @Column({ name: 'detail' })
    public detail: string;

    @Column({ name: 'imageURL' })
    public imageURL: string;

    @Column({ name: 'coverURL' })
    public coverURL: string;

    @Column({ name: 'coverPosition' })
    public coverPosition: number;

    @Column({ name: 'ownerUser' })
    public ownerUser: string;

    @Column({ name: 'isOfficial' })
    public isOfficial: boolean;

    @Column({ name: 'color' })
    public color: string;

    @Column({ name: 'category' })
    public category: ObjectID;

    @Column({ name: 'banned' })
    public banned: boolean;

    @Column({ name: 'lineId' })
    public lineId: string;

    @Column({ name: 'facebookURL' })
    public facebookURL: string;

    @Column({ name: 'twitterURL' })
    public twitterURL: string;

    @Column({ name: 'instagramURL' })
    public instagramURL: string;

    @Column({ name: 'websiteURL' })
    public websiteURL: string;

    @Column({ name: 'mobileNo' })
    public mobileNo: string;

    @Column({ name: 'address' })
    public address: string;

    @Column({ name: 'email' })
    public email: string;

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().toDate();
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.updateDate = moment().toDate();
    }
}
