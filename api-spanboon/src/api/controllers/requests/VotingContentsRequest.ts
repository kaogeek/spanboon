/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import 'reflect-metadata';

export class VotingContentsRequest {
    public limit: number;
    public offset: number;
    public keyword: any;
    public pin: boolean;
    public myVote: boolean;
    public supporter: boolean;
    public closeVote: boolean;
    public hashTagVote: boolean;
    public myVoterSupport: boolean;
    public myVoted: boolean;
    public mySupported: boolean;
    public closetSupport: boolean;
    public generalSection: boolean;
    public voteObjId: any;
}
