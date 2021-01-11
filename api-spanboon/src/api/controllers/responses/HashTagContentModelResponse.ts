/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { ContentModelResponse } from './ContentModelResponse';

export class HashTagContentModelResponse extends ContentModelResponse {

    public postCount: number;
    public twitterCount: number;
    public facebookCount: number;
    public updateDate: Date;
}