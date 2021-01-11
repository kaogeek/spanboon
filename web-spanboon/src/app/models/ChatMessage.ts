/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { BaseModel } from './BaseModel';

export class ChatMessage extends BaseModel {

    public id: string;
    public sender: string;
    public senderType: string;
    public message: string;
    public room: string;
    public fileId: string;
    public filePath: string;
    public videoURL: string;
    public isRead: boolean;
    public deleted: boolean;
}