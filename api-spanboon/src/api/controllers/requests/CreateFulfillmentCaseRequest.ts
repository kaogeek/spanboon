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
    public needs: any[]; // for post mode
    public items: any[]; // for page mode ex. {standardItemId: string, quantity: number } or {customItemId: string, quantity: number } 
    public requester: string;
}
