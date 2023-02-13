/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Column, Entity, BeforeInsert, ObjectIdColumn, ObjectID, BeforeUpdate } from 'typeorm';
import moment = require('moment/moment');
import { IsNotEmpty, IsMongoId } from 'class-validator';
import { BaseModel } from './BaseModel';

@Entity('AdminUserActionLogs')
export class AdminUserActionLogs extends BaseModel {

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'ip' })
    public ip: string;

    @Column({ name: 'contentId' })
    public contentId: string;

    @Column({ name: 'userId' })
    public userId: number;

    @Column({ name: 'clientId' })
    public clientId: number;

    @Column({ name: 'contentType' })
    public contentType: string;

    @Column({ name: 'action' })
    public action: string;

    @Column({ name: 'data' })
    public data: any;

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
