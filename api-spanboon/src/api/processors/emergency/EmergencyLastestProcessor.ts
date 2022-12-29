/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { PostsService } from '../../services/PostsService';

export class EmergencyLastestProcessor extends AbstractTypeSectionProcessor {

    public static TYPE = 'EMERGENCY_LASTEST';

    constructor(private postsService: PostsService) {
        super();
        this.type = EmergencyLastestProcessor.TYPE;
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let emergencyEventId = undefined;
                let limit = undefined;
                let userId = undefined;
                if (this.data !== undefined && this.data !== null) {
                    emergencyEventId = this.data.emergencyEventId;
                    limit = this.data.limit;
                    userId = this.data.userId;
                }

                if (emergencyEventId === undefined || emergencyEventId === null || emergencyEventId === '') {
                    resolve(undefined);
                    return;
                }

                if (limit === undefined || limit === null || limit === '') {
                    limit = 1;
                }

                // search first post of emergencyEvent and join gallery
                const postAgg = [
                    { $match: { emergencyEvent: emergencyEventId, deleted: false } },
                    { $sort: { startDateTime: -1 } },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: 'SocialPost',
                            localField: '_id',
                            foreignField: 'postId',
                            as: 'socialPosts'
                        }
                    },
                    {
                        $project: {
                            'socialPosts': {
                                '_id': 0,
                                'pageId': 0,
                                'postId': 0,
                                'postBy': 0,
                                'postByType': 0
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'PostsGallery',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'postGallery'
                        }
                    }
                ];
                const searchResult = await this.postsService.aggregate(postAgg);

                let result = undefined;
                if (searchResult !== undefined && searchResult.length > 0) {
                    // insert isLike Action
                    if (userId !== undefined && userId !== null && userId !== '') {
                        for (const post of searchResult) {
                            const userAction: any = await this.postsService.getUserPostAction(post._id + '', userId, true, true, true, true);
                            const isLike = userAction.isLike;
                            const isRepost = userAction.isRepost;
                            const isComment = userAction.isComment;
                            const isShare = userAction.isShare;

                            post.isLike = isLike;
                            post.isRepost = isRepost;
                            post.isComment = isComment;
                            post.isShare = isShare;
                        }
                    }

                    result = {
                        title: 'โพสต์ต่างๆ ในช่วงนี้', // as a emergencyEvent name
                        subTitle: '',
                        detail: '',
                        posts: searchResult,
                        type: this.type
                    };
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}