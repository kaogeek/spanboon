/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
import { SearchFilter } from './SearchFilterRequest';

export class SearchRequest {
    public id:string;
    public keyword: string[];
    public userId: string;
    public filter: SearchFilter;
    public type:string;
    public field:string;
    public buckets:any;
    public values:any;
}
