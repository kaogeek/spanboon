/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';

export class UpdateEmergencyEventRequest {

    public title: string;
    public detail: string;
    public coverPageURL: string;
    public hashTag: string;
    public asset: any;
    public isClose: boolean;
    public isPin: boolean;
    public ordering:number;
}