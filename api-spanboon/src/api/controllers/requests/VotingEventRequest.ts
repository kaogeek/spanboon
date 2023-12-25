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
    public supportDaysRange: number;
    public voteDaysRange: number;
    public approveDatetime: Date;
    public approveUsername: string;
    public updateDatetime: Date;
    public hashTag: string;

    public startSupportDatetime: Date;
    public endSupportDatetime: Date;
    
    public startVoteDatetime: Date;
    public endVoteDatetime: Date;
    // public create_user: string;
    public status: any;
    public createAsPage: string;
    public type: any;
    public public: boolean;
    public pin: boolean;
    public showVoterName: boolean;
    public showVoteResult: boolean;
    public voteItem: any[];
    public voteChoice: any[];
    public service: string;
    public oldPictures: any[];
    public delete: any[];
}
