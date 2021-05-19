/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { UserLikeService } from '../../services/UserLikeService';
import { LIKE_TYPE } from '../../../constants/LikeType';

export class EmergencyPostLikedProcessor extends AbstractTypeSectionProcessor {

    constructor(private userLikeService: UserLikeService) {
        super();
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

                // post like 
                const postLikeMatchStmt: any = {
                    subjectType: LIKE_TYPE.POST
                };

                const gallerySocialPostsAgg: any[] = [
                    { $match: postLikeMatchStmt },
                    { $sort: { startDateTime: -1 } },
                    {
                        $lookup: {
                            from: 'Posts',
                            localField: 'subjectId',
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
                    { $match: { 'posts.emergencyEvent': emergencyEventId } },
                    { $group: { _id: '$subjectId', count: { $sum: 1 } } },
                    {
                        $lookup: {
                            from: 'PostsGallery',
                            localField: '_id',
                            foreignField: '_id',
                            as: 'galleries'
                        }
                    },
                ];

                if (sampleCount !== undefined) {
                    gallerySocialPostsAgg.push({ $sample: { size: sampleCount } });
                }

                const likePostGallery: any[] = await this.userLikeService.aggregate(gallerySocialPostsAgg);

                const counstUserSocialPostsAgg: any[] = [
                    { $match: postLikeMatchStmt },
                    { $sort: { startDateTime: -1 } },
                    {
                        $lookup: {
                            from: 'Posts',
                            localField: 'subjectId',
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
                    { $match: { 'posts.emergencyEvent': emergencyEventId } },
                    { $group: { _id: '$userId', count: { $sum: 1 } } },
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

                if (sampleCount !== undefined) {
                    counstUserSocialPostsAgg.push({ $sample: { size: sampleCount } });
                }

                const userLikePostCount: any[] = await this.userLikeService.aggregate(counstUserSocialPostsAgg);

                const result: any = {
                    title: 'คนเหล่านี้ชอบภาพจากโพสต์',
                    subTitle: '',
                    detail: '',
                    type: this.type,
                    users: [],
                    galleries: []
                };

                if (userLikePostCount !== undefined && userLikePostCount.length > 0) {
                    for (const userLike of userLikePostCount) {
                        if (userLike.user !== undefined) {
                            result.users.push(userLike.user);
                        }
                    }
                }

                if (likePostGallery !== undefined && likePostGallery.length > 0) {
                    for (const likePost of likePostGallery) {
                        result.galleries = result.galleries.concat(likePost.galleries);
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}