/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';
export class UpdateUserProfileRequest {

    public displayName: string;
    public firstName: string;
    public lastName: string;
    public birthdate: Date;
    public gender: number;
    public customGender: string;
    public province:string;
    public membership:boolean;
}
