/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';

export class CreateFulfillmentCaseRequest {

    public postId: string;
    public pageId: string;
    public needs: any[];
    public items: any[];
    public requester: string;
}
