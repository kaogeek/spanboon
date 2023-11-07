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
    public minSupport: number;
    public countSupport: number;
    public startVoteDatetime: Date;
    public endVoteDatetime: Date;
    public approveDatetime: Date;
    public approveUsername: string;
    public updateDatetime: Date;
    // public create_user: string;
    public status: any;
    public createAsPage: string;
    public type: any;
    public public: boolean;
    public pin: boolean;
    public voteItem: string;
    public showVoterName: boolean;
    public showVoteResult: boolean;
}
