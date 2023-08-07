/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';

export class SearchFilter {

    public limit: number;

    public offset: number;

    public select: any[];

    public relation: any;

    public whereConditions: any;

    public orderBy: any;
    
    public count: boolean;

    public typePage:string;

    public typeUser:string;

    public typeHashTag:string;

    public keyword:string[];

}
