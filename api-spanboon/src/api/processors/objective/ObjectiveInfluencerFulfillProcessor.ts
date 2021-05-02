/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { FulfillmentCaseService } from '../../services/FulfillmentCaseService';
import { UserFollowService } from '../../services/UserFollowService';
import { FULFILLMENT_STATUS } from '../../../constants/FulfillmentStatus';

export class ObjectiveInfluencerFulfillProcessor extends AbstractTypeSectionProcessor {

    constructor(private fulfillmentCaseService: FulfillmentCaseService, private userFollowService: UserFollowService) {
        super();
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let objectiveId = undefined;
                let startDateTime = undefined;
                let endDateTime = undefined;
                let sampleCount = undefined;

                if (this.data !== undefined && this.data !== null) {
                    objectiveId = this.data.objectiveId;
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    sampleCount = this.data.sampleCount;
                }

                if (objectiveId === undefined || objectiveId === null || objectiveId === '') {
                    resolve(undefined);
                }

                const dateTimeAndArray = [];
                if (startDateTime !== undefined) {
                    dateTimeAndArray.push({ startDateTime: { $gte: startDateTime.toISOString() } });
                }
                if (endDateTime !== undefined) {
                    dateTimeAndArray.push({ startDateTime: { $lte: endDateTime.toISOString() } });
                }

                const topInfluencer = await this.userFollowService.getTopInfluencerUserFollow(sampleCount);

                let result: any = undefined;
                if (topInfluencer !== undefined && topInfluencer.length > 0) {
                    // post with objective and influencer was comment
                    const influencerMap = {};
                    const fulfillUser = [];
                    for (const influe of topInfluencer) {
                        fulfillUser.push(influe._id);
                        influencerMap[influe._id + ''] = influe;
                    }

                    const matchStmt: any = { requester: { $in: fulfillUser }, deleted: false, status: FULFILLMENT_STATUS.CONFIRM };
                    if (dateTimeAndArray.length > 0) {
                        matchStmt['$and'] = dateTimeAndArray;
                    }

                    const fulfillmentAgg = [
                        { $match: matchStmt },
                        { $sort: { startDateTime: -1 } },
                        {
                            $lookup: {
                                from: 'Posts',
                                localField: 'postId',
                                foreignField: '_id',
                                as: 'posts'
                            }
                        },
                        {
                            $unwind: {
                                path: '$posts',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        { $match: { objective: objectiveId } },
                        { $group: { _id: '$requester', count: { $sum: 1 } } },
                        {
                            $lookup: {
                                from: 'User',
                                localField: '_id',
                                foreignField: '_id',
                                as: 'user'
                            }
                        },
                        {
                            $unwind: {
                                path: '$user',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $project: {
                                'user.password': 0,
                                'user.coverPosition': 0,
                                'user.birthdate': 0,
                                'user.coverURL': 0,
                            }
                        }
                    ];
                    const objectiveInflu = await this.fulfillmentCaseService.aggregate(fulfillmentAgg);

                    const addedUserIds = [];
                    const distinctTopInfluencer = [];
                    if (objectiveInflu && objectiveInflu.length > 0) {
                        for (const objInflu of objectiveInflu) {
                            const key = objInflu._id + '';
                            if (addedUserIds.indexOf(key) >= 0) {
                                continue;
                            }

                            if (influencerMap[key]) {
                                distinctTopInfluencer.push(influencerMap[key]);
                                addedUserIds.push(key);
                            }
                        }
                    }

                    // generate title
                    result = this.generateResult(distinctTopInfluencer);
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    private generateResult(topInfluencer: any[]): any {
        let result = undefined;

        if (topInfluencer && topInfluencer.length > 0) {
            result = {
                title: 'พวกเขาเหล่านี้ได้เข้ามาเติมเต็ม',
                subTitle: '',
                detail: '',
                type: this.type,
                influencers: []
            };

            // count as a number as case that was fulfill.
            for (const influe of topInfluencer) {
                result.influencers.push(influe);
            }
        }

        return result;
    }
}