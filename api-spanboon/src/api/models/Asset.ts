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

@Entity('Asset')
export class Asset extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'userId' })
    public userId: any;

    @Index({ unique: true })
    @Column({ name: 'fileName' })
    public fileName: string;

    @IsNotEmpty()
    @Column({ name: 'scope' })
    public scope: number;

    @IsNotEmpty()
    @Column({ name: 'data' })
    public data: string;

    @IsNotEmpty()
    @Column({ name: 'mimeType' })
    public mimeType: string;

    @Column({ name: 'size' })
    public size: number;

    @Column({ name: 'expirationDate' })
    public expirationDate: Date;

    @Column({ name: 's3FilePath' })
    public s3FilePath: string;

    @Column({ name: 'pageObjectiveId' })
    public pageObjectiveId: ObjectID;

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
