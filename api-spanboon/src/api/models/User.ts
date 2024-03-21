/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsEmail, IsMongoId } from 'class-validator';
import { Exclude } from 'class-transformer';
import { BeforeInsert, BeforeUpdate, Column, Entity, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment from 'moment';
import * as bcrypt from 'bcrypt';
@Entity('User', { name: 'User' })
export class User extends BaseModel {

    public static hashPassword(password: string): Promise<string> {
        return new Promise((resolve, reject) => {
            bcrypt.hash(password, 10, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    }

    public static randomPassword(): Promise<string> {
        return new Promise((resolve) => {
            resolve(Math.floor(100000 + Math.random() * 900000).toString());
        });
    }

    public static comparePassword(user: User, password: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                resolve(res === true);
            });
        });
    }

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'username' })
    public username: string;

    @IsNotEmpty()
    @Exclude()
    @Column({ name: 'password' })
    public password: string;

    @IsEmail()
    @Column({ name: 'email' })
    public email: string;

    @Column({ name: 'firstName' })
    public firstName: string;

    @Column({ name: 'lastName' })
    public lastName: string;

    @Column({ name: 'displayName' })
    public displayName: string;

    @Column({ name: 'uniqueId' })
    public uniqueId: string;

    @Column({ name: 'citizenId' })
    public citizenId: string;

    @Column({ name: 'gender' })
    public gender: number;

    @Column({ name: 'customGender' })
    public customGender: string;

    @Column({ name: 'isAdmin' })
    public isAdmin: boolean;

    @Column({ name: 'isSubAdmin' })
    public isSubAdmin: boolean;

    @Column({ name: 'birthdate' })
    public birthdate: Date;

    @Column({ name: 'monthDate'})
    public monthDate: string;

    @Column({ name: 'dayDate'})
    public dayDate: string;

    @Column({ name: 'imageURL' })
    public imageURL: string;

    @Column({ name: 's3ImageURL' })
    public s3ImageURL: string;

    @Column({ name: 'coverURL' })
    public coverURL: string;

    @Column({ name: 's3CoverURL' })
    public s3CoverURL: string;

    @Column({ name: 'coverPosition' })
    public coverPosition: number;

    @Column({ name: 'banned' })
    public banned: boolean;

    @Column({ name: 'mergeEM' })
    public mergeEM: boolean;

    @Column({ name: 'mergeFB' })
    public mergeFB: boolean;

    @Column({ name: 'mergeTW' })
    public mergeTW: boolean;

    @Column({ name: 'mergeGG' })
    public mergeGG: boolean;

    @Column({ name: 'mergeAP' })
    public mergeAP: boolean;

    @Column({ name: 'isSyncPage' })
    public isSyncPage: boolean;

    @Column({ name: 'province' })
    public province: string;

    @Column({ name: 'subscribeEmail' })
    public subscribeEmail: boolean;

    @Column({ name: 'subscribeNoti' })
    public subscribeNoti: boolean;

    @Column({ name: 'ua' })
    public ua: Date;

    @Column({ name: 'uaVersion' })
    public uaVersion: number;

    @Column({ name: 'tos' })
    public tos: Date;

    @Column({ name: 'tosVersion' })
    public tosVersion: number;

    @Column({ name: 'subjectAttention' })
    public subjectAttention: any;

    @Column({ name: 'delete' })
    public delete: boolean;

    @Column({ name: 'isOfficial' })
    public isOfficial: boolean;

    @Column({ name: 'membership'})
    public membership: boolean;

    // @Column(type => AuthenticationId)
    // public authenticationId: AuthenticationId;

    // @Column(type => PageAccessLevel)
    // public pageAccessLevel: PageAccessLevel;

    // @Column(type => Posts)
    // public posts: Posts[];

    // @Column(type => Page)
    // public pages: Page[];

    // @Column(type => PageFollower)
    // public pageFollowers: PageFollower[];

    // @Column(type => Fulfillment)
    // public Fulfillments: Fulfillment[];

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
