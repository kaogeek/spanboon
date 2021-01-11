/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  p-nattawadee <nattawdee.l@absolute.co.th>,  Chanachai-Pansailom <chanachai.p@absolute.co.th> , Americaso <treerayuth.o@absolute.co.th >
 */

import { BaseModel } from "./BaseModel"
import { HashTagContentModel } from './HashTagContentModel';
import { SectionModel } from './SectionModel';

export class MainPageModel extends BaseModel{
    public id: string;
    public emergencyEvents: HashTagContentModel[];
    public emergencyPin: HashTagContentModel;
    public lastest: SectionModel;
    public hots: SectionModel[];
    public viewSection: SectionModel;
    public sectionModel: SectionModel;
}
