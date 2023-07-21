/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';

export class JoinObjectiveRequest {
    public objectiveId: string;
    public pageId: string;
    public joiner: string;
    public join:boolean;
    public approve:boolean; 
}
