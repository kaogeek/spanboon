/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';

export class VoteItemRequest {
    public ordering: number;
    public type: any;
    public title: string;
    public assetId: string;
    public coverPageURL: string;
    public s3CoverPageURL: string;
    public voteChoice:any[];
}