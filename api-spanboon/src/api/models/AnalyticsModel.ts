/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { ObjectID } from 'mongodb';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ObjectIdColumn,
} from 'typeorm';
import { BaseModel } from './BaseModel';
import moment from 'moment';

@Entity('Analytics')
export class AnalyticsModel extends BaseModel {
  @ObjectIdColumn({ name: '_id' })
  @IsNotEmpty()
  @IsMongoId()
  public id: ObjectID;

  @Column({ name: 'mfpUsers' })
  public mfpUsers: any;

  @Column({ name: 'followerPage' })
  public followerPage: any;

  @Column({ name: 'totalMFP' })
  public totalMFP: any;

  @Column({ name: 'totalUSERS' })
  public totalUSERS: any;
  
  @Column({ name: 'loginBy' })
  public loginBy: any;

  @Column({ name: 'expiredDate' })
  public expiredDate: any;

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
