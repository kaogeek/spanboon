/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { UserFollowService } from '../../services/UserFollowService';
import { SocialPostService } from '../../services/SocialPostService';
import { ObjectID } from 'mongodb';

export class EmergencyShareProcessor extends AbstractTypeSectionProcessor {

    public static TYPE = 'EMERGENCY_SHARE';

    constructor(private userFollowService: UserFollowService, private socialPostService: SocialPostService) {
        super();
        this.type = EmergencyShareProcessor.TYPE;
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let emergencyEventId = undefined;
                let startDateTime = undefined;
                let endDateTime = undefined;
                let sampleCount = undefined;
                let userId = undefined;

                if (this.data !== undefined && this.data !== null) {
                    emergencyEventId = this.data.emergencyEventId;
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    sampleCount = this.data.sampleCount;
                    userId = this.data.userId;
                }

                if (emergencyEventId === undefined || emergencyEventId === null || emergencyEventId === '') {
                    resolve(undefined);
                    return;
                }

                const dateTimeAndArray = [];
                if (startDateTime !== undefined) {
                    dateTimeAndArray.push({ startDateTime: { $gte: startDateTime } });
                }
                if (endDateTime !== undefined) {
                    dateTimeAndArray.push({ startDateTime: { $lte: endDateTime } });
                }

                let topInfluencer = await this.userFollowService.getTopInfluencerUserFollow(sampleCount);

                if (userId !== undefined && userId !== '') {
                    const userFriend = await this.userFollowService.getUserFollower(new ObjectID(userId), sampleCount);
                    if (userFriend && userFriend.length > 0) {
                        topInfluencer = topInfluencer.concat(userFriend);
                    }
                }

                const topPageInfluencer = await this.userFollowService.getTopInfluencerPageFollow(sampleCount);

                let result: any = undefined;
                if (topInfluencer !== undefined && topInfluencer.length > 0) {
                    // post with emergencyEvent and influencer was comment
                    const influencerMap = {};
                    const socialPostUser = [];
                    for (const influe of topInfluencer) {
                        socialPostUser.push(influe._id);
                        influencerMap[influe._id + ''] = influe;
                    }

                    // page influencer
                    const pageInfluencerMap = {};
                    const socialPostPageUser = [];
                    for (const influe of topPageInfluencer) {
                        socialPostPageUser.push(influe._id);
                        pageInfluencerMap[influe._id + ''] = influe;
                    }

                    // user type social
                    const socialAggMatchStmt: any = { $or: [{ postByType: 'USER', postBy: { $in: socialPostUser } }, { postByType: 'PAGE', postBy: { $in: socialPostPageUser } }] };
                    if (dateTimeAndArray.length > 0) {
                        socialAggMatchStmt['$and'] = dateTimeAndArray;
                    }

                    const userSocialPostsAgg = [
                        { $match: socialAggMatchStmt },
                        { $sort: { startDateTime: -1 } },
                        {
                            $lookup: {
                                from: 'Posts',
                                localField: 'post',
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
                        { $match: { emergencyEvent: emergencyEventId } },
                        { $group: { _id: '$postBy', count: { $sum: 1 } } }
                    ];
                    const userSocialPost = await this.socialPostService.aggregate(userSocialPostsAgg);

                    const addedUserIds = [];
                    const addedPageIds = [];
                    const distinctTopInfluencer = [];
                    if (userSocialPost && userSocialPost.length > 0) {
                        for (const objInflu of userSocialPost) {
                            const key = objInflu._id + '';
                            if (addedUserIds.indexOf(key) >= 0) {
                                continue;
                            }

                            if (addedPageIds.indexOf(key) >= 0) {
                                continue;
                            }

                            if (influencerMap[key]) {
                                distinctTopInfluencer.push(influencerMap[key]);
                                addedUserIds.push(key);
                            } else if (pageInfluencerMap[key]) {
                                distinctTopInfluencer.push(pageInfluencerMap[key]);
                                addedPageIds.push(key);
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
            // generate title
            const title = 'เพื่อนของคุณและพวกเขาเหล่านี้ได้เข้ามาแชร์';

            result = {
                title,
                subTitle: '',
                detail: '',
                type: this.type,
                influencers: []
            };

            for (const influe of topInfluencer) {
                result.influencers.push(influe);
            }
        }

        return result;
    }
}