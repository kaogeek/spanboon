/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { SearchFilter } from './SearchFilterRequest';

export class FindVoteRequest {
    public keyword: any;
    public filter: SearchFilter;
    public whereConditions: any;
    public approved:boolean;
    public closed:boolean;
    public pin:boolean;
    public showed:boolean;
    public status:any;
    public type:any;
}
