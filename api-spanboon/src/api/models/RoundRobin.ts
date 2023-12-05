/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { BaseModel } from './BaseModel';

export class SectionModel extends BaseModel {
    public partyExecutive: any;
    public deputyLeader: any;
    public deputySecretary: any;
    public isList = false;
    public isHighlight = false;
}