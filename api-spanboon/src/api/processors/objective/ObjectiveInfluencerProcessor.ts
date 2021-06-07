/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { PostsCommentService } from '../../services/PostsCommentService';
import { UserFollowService } from '../../services/UserFollowService';

export class ObjectiveInfluencerProcessor extends AbstractTypeSectionProcessor {

    public static TYPE = 'OBJECTIVE_INFLUENCER';

    constructor(private postsCommentService: PostsCommentService, private userFollowService: UserFollowService) {
        super();
        this.type = ObjectiveInfluencerProcessor.TYPE;
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
                    return;
                }

                const dateTimeAndArray = [];
                if (startDateTime !== undefined) {
                    dateTimeAndArray.push({ startDateTime: { $gte: startDateTime } });
                }
                if (endDateTime !== undefined) {
                    dateTimeAndArray.push({ startDateTime: { $lte: endDateTime } });
                }

                const topInfluencer = await this.userFollowService.getTopInfluencerUserFollow(sampleCount);

                let result: any = undefined;
                if (topInfluencer !== undefined && topInfluencer.length > 0) {
                    // post with objective and influencer was comment
                    const influencerMap = {};
                    const commentUser = [];
                    for (const influe of topInfluencer) {
                        commentUser.push(influe._id);
                        influencerMap[influe._id + ''] = influe;
                    }

                    const commentAggMatchStmt: any = { user: { $in: commentUser }, deleted: false };
                    if (dateTimeAndArray.length > 0) {
                        commentAggMatchStmt['$and'] = dateTimeAndArray;
                    }

                    const commentAgg = [
                        { $match: commentAggMatchStmt },
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
                        { $match: { objective: objectiveId } },
                        { $group: { _id: '$user', count: { $sum: 1 } } },
                        {
                            $project: {
                                'user.password': 0,
                                'user.coverPosition': 0,
                                'user.birthdate': 0,
                                'user.coverURL': 0,
                            }
                        }
                    ];
                    const objectiveInflu = await this.postsCommentService.aggregate(commentAgg);

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
            // generate title
            let title = topInfluencer[0].user ? topInfluencer[0].user.displayName : '';
            if (topInfluencer.length > 1) {
                if (title !== '') {
                    title += ' และ ';
                }

                if (topInfluencer[1].user && topInfluencer[1].user.displayName !== '') {
                    title += topInfluencer[1].user.displayName;
                }
            }

            if (title !== '') {
                title += ' ได้เข้ามาพูดคุยในโพส';
            }

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