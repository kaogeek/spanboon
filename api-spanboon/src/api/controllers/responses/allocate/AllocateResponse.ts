/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Posts } from '../../../models/Posts';

export class AllocateResponse {

    public needsId: string;
    public postsId: string;
    public posts: Posts;
    public quantity: number;
    public amount: number;
    public itemName: string;
    public itemUnit: string;
}