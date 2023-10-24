/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';

export class VotingEventRequest {
    public title: string;
    public detail: string;
    public assetId: string;
    public coverPageURL: string;
    public s3CoverPageURL: string;
    public needed: number;
    public approved: boolean;
    public closed: boolean;
    public min_support: number;
    public count_support: number;
    public start_vote_datetime: Date;
    public end_vote_datetime: Date;
    public approve_datetime: Date;
    public approve_name: string;
    public update_datetime: Date;
    public create_user: string;
    public status: any;
    public create_as_page: string;
    public type: any;
    public public: boolean;
    public pin: boolean;
    public voteItem: string;
    public showed: boolean;
}
