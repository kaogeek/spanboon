/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { BaseModel } from "./BaseModel"

export class SectionModel extends BaseModel{
    public title: string;
    public description: Text;
    public subtitle: string;
    public link: string;
    public contents: any[];
    public iconURL: string;
    public contentCount: number;
    public updateDateTime: Date;
    public type: string;
}
