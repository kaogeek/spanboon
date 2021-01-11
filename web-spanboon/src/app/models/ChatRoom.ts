/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { BaseModel } from './BaseModel';

export class ChatRoom extends BaseModel {

    public id: string;
    public name: string;
    public type: string;
    public typeId: string;
    public deleted: boolean;
    public participants: any[]; // data pattern is { sender: string, senderType: string}
}