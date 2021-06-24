/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { UserFollowService } from '../../services/UserFollowService';
import { SUBJECT_TYPE } from '../../../constants/FollowType';

export class EmergencyInfluencerFollowedProcessor extends AbstractTypeSectionProcessor {

    public static TYPE = 'EMERGENCY_INFLUENCER_FOLLOWED';

    constructor(private userFollowService: UserFollowService) {
        super();
        this.type = EmergencyInfluencerFollowedProcessor.TYPE;
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let emergencyEventId = undefined;
                let sampleCount = undefined;

                if (this.data !== undefined && this.data !== null) {
                    emergencyEventId = this.data.emergencyEventId;
                    sampleCount = this.data.sampleCount;
                }

                if (emergencyEventId === undefined || emergencyEventId === null || emergencyEventId === '') {
                    resolve(undefined);
                    return;
                }

                const topInfluencer = await this.userFollowService.getTopInfluencerUserFollow(sampleCount);

                let result: any = undefined;
                if (topInfluencer !== undefined && topInfluencer.length > 0) {
                    // post with emergencyEvent and influencer was comment
                    const influencerMap = {};
                    const fulfillUser = [];
                    for (const influe of topInfluencer) {
                        fulfillUser.push(influe._id);
                        influencerMap[influe._id + ''] = influe;
                    }

                    const matchStmt: any = { userId: { $in: fulfillUser }, subjectId: emergencyEventId, subjectType: SUBJECT_TYPE.EMERGENCY_EVENT };

                    const followingAgg = [
                        { $match: matchStmt },
                        {
                            $lookup: {
                                from: 'User',
                                localField: 'userId',
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
                    const emergencyEventInflu = await this.userFollowService.aggregate(followingAgg);

                    // generate title
                    result = this.generateResult(emergencyEventInflu);
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
                title: 'พวกเขาเหล่านี้ได้เข้ามาติดตาม',
                subTitle: '',
                detail: '',
                type: this.type,
                influencers: []
            };

            for (const influe of topInfluencer) {
                if (!influe.user) {
                    continue;
                }
                result.influencers.push(influe.user);
            }
        }

        return result;
    }
}