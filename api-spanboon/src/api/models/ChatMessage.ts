/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { IsNotEmpty, IsMongoId } from 'class-validator';
import { Entity, Column, BeforeInsert, BeforeUpdate, ObjectIdColumn } from 'typeorm';
import { ObjectID } from 'mongodb';
import { BaseModel } from './BaseModel';
import moment = require('moment');

@Entity('ChatMessage')
export class ChatMessage extends BaseModel {

    /*
    * fileId is file Id of Spanboon which is image or video file.
    * filePath is the path of image file of Spanboon Only.
    * videoURL is the path of video of Spanboon or Youtube URL.
    */

    @ObjectIdColumn({ name: '_id' })
    @IsNotEmpty()
    @IsMongoId()
    public id: ObjectID;

    @Column({ name: 'sender' })
    public sender: ObjectID;

    @Column({ name: 'senderType' })
    public senderType: string;

    @Column({ name: 'message' })
    public message: string;

    @Column({ name: 'messageType' })
    public messageType: string;

    @Column({ name: 'room' })
    public room: ObjectID;

    @Column({ name: 'fileId' })
    public fileId: ObjectID;

    @Column({ name: 'filePath' })
    public filePath: string;

    @Column({ name: 'videoURL' })
    public videoURL: string;

    @Column({ name: 'itemId' })
    public itemId: ObjectID;

    @Column({ name: 'itemType' })
    public itemType: string;

    @Column({ name: 'isRead' })
    public isRead: boolean;

    @Column({ name: 'deleted' })
    public deleted: boolean;

    @Column({ name: 'readers' })
    public readers: any[]; // {sender: ObjectID senderType: string}

    @BeforeInsert()
    public async createDetails(): Promise<void> {
        this.createdDate = moment().toDate();
    }

    @BeforeUpdate()
    public async updateDetails(): Promise<void> {
        this.updateDate = moment().toDate();
    }
}