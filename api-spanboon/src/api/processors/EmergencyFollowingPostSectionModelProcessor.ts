/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { AbstractSeparateSectionProcessor } from './AbstractSeparateSectionProcessor';
import { SectionModel } from '../models/SectionModel';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { S3Service } from '../services/S3Service';
import { UserFollowService } from '../services/UserFollowService';
// import { UserLike } from '../models/UserLike';
import { ObjectID } from 'mongodb';
export class EmergencyFollowingPostSectionModelProcessor extends AbstractSeparateSectionProcessor {
    private DEFAULT_SEARCH_LIMIT = 8;
    private DEFAULT_SEARCH_OFFSET = 0;
    constructor(
        private s3Service: S3Service,
        private userFollowService: UserFollowService,
    ) {
        super();
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                // let searchOfficialOnly: number = undefined;
                let userId = undefined;
                let isReadPostIds = undefined;
                let startDateTime: Date = undefined;
                // get startDateTime, endDateTime
                if (this.data !== undefined && this.data !== null) {
                    userId = this.data.userId;
                    startDateTime = this.data.startDateTime;
                    isReadPostIds = this.data.postIds;

                }
                const objIds = new ObjectID(userId);
                const limit = this.DEFAULT_SEARCH_LIMIT;
                const offset = this.DEFAULT_SEARCH_OFFSET;
                const searchFilter: SearchFilter = new SearchFilter();
                searchFilter.limit = limit;
                searchFilter.offset = offset;
                searchFilter.orderBy = {
                    summationScore: 1
                };
                searchFilter.whereConditions = {
                    isClose: false
                };

                const searchCountFilter: SearchFilter = new SearchFilter();
                searchCountFilter.count = true;
                searchCountFilter.whereConditions = {
                    isClose: false
                };
                const postIds = [];
                if (isReadPostIds.length > 0) {
                    for (let i = 0; i < isReadPostIds.length; i++) {
                        const postId = isReadPostIds[i].postId;
                        if (postId !== undefined && postId !== null && postId.length > 0) {
                            postIds.push(...postId.map(id => new ObjectID(id)));
                        }
                    }
                }

                let isFollowing = undefined;
                // const today = moment().add(month, 'month').toDate();
                if (postIds !== undefined && postIds.length > 0) {
                    isFollowing = await this.userFollowService.aggregate([
                        {
                            $match: {
                                userId: objIds,
                                subjectType: 'EMERGENCY_EVENT'
                            }
                        },
                        {
                            $lookup: {
                                from: 'EmergencyEvent',
                                let: { subjectId: '$subjectId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$$subjectId', '$_id'] }
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'Posts',
                                            let: { id: '$_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: { $eq: ['$$id', '$emergencyEvent'] }
                                                    }
                                                },
                                                {
                                                    $match: {
                                                        _id: { $nin: postIds.flat() },
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false,
                                                        startDateTime: { $lte: startDateTime },
                                                    }
                                                },
                                                {
                                                    $sort: {
                                                        summationScore: -1,
                                                    },
                                                },
                                                {
                                                    $limit: 8,

                                                },
                                                {
                                                    $lookup: {
                                                        from: 'PostsGallery',
                                                        localField: '_id',
                                                        foreignField: 'post',
                                                        as: 'gallery',
                                                    },
                                                },
                                                {
                                                    $lookup: {
                                                        from: 'User',
                                                        let: { ownerUser: '$ownerUser' },
                                                        pipeline: [
                                                            {
                                                                $match: {
                                                                    $expr: { $eq: ['$$ownerUser', '$_id'] },
                                                                },

                                                            },
                                                            { $project: { email: 0, username: 0, password: 0 } }
                                                        ],
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
                                                        story: 0
                                                    }

                                                },
                                            ],
                                            as: 'posts'
                                        }
                                    }
                                ],
                                as: 'emergencyEvent'
                            }
                        },
                        {
                            $unwind: {
                                path: '$emergencyEvent',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                    ]);
                } else {
                    isFollowing = await this.userFollowService.aggregate([
                        {
                            $match: {
                                userId: objIds
                            }
                        },
                        {
                            $lookup: {
                                from: 'EmergencyEvent',
                                let: { subjectId: '$subjectId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: { $eq: ['$$subjectId', '$_id'] }
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'Posts',
                                            let: { id: '$_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: { $eq: ['$$id', '$emergencyEvent'] }
                                                    }
                                                },
                                                {
                                                    $match: {
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false,
                                                        startDateTime: { $lte: startDateTime },
                                                    }
                                                },
                                                {
                                                    $sort: {
                                                        summationScore: -1,
                                                    },
                                                },
                                                {
                                                    $limit: 8

                                                },
                                                {
                                                    $lookup: {
                                                        from: 'PostsGallery',
                                                        localField: '_id',
                                                        foreignField: 'post',
                                                        as: 'gallery',
                                                    },
                                                },
                                                {
                                                    $lookup: {
                                                        from: 'User',
                                                        let: { ownerUser: '$ownerUser' },
                                                        pipeline: [
                                                            {
                                                                $match: {
                                                                    $expr: { $eq: ['$$ownerUser', '$_id'] },
                                                                },

                                                            },
                                                            { $project: { email: 0, username: 0, password: 0 } }
                                                        ],
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
                                                        story: 0
                                                    }

                                                },
                                            ],
                                            as: 'posts'
                                        }
                                    }
                                ],
                                as: 'emergencyEvent'
                            }
                        },
                        {
                            $unwind: {
                                path: '$emergencyEvent',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                    ]);
                }
                let summationScore = undefined;
                if (isFollowing.length > 0) {
                    summationScore = isFollowing.sort((a, b) => b.emergencyEvent.posts[0].summationScore - a.emergencyEvent.posts[0].summationScore);
                } else {
                    summationScore = isFollowing;
                }
                const sliceArray = summationScore.slice(0, 1);
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'เพราะคุณติดตาม' : this.config.title;
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = 'เพราะคุณติดตาม'; // set type by processor type
                const lastestDate = null;
                if (isFollowing.length > 0) {
                    for (const rows of sliceArray) {
                        if (rows.subjectType === 'EMERGENCY_EVENT') {
                            const contents: any = {};
                            contents.owner = {};
                            contents.owner = await this.parseEmergencyField(rows.emergencyEvent);
                            result.contents.push(contents);
                        }
                    }
                }
                result.dateTime = lastestDate;
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    private async parseEmergencyField(emergency: any): Promise<any> {
        const emergencyResult: any = {};
        if (emergency !== undefined) {
            emergencyResult.id = emergency._id;
            emergencyResult.title = emergency.title;
            emergencyResult.detail = emergency.detail;
            emergencyResult.hashtag = emergency.hashTag;
            emergencyResult.isPin = emergency.isPin;
            emergencyResult.coverPageURL = emergency.coverPageURL;
            emergencyResult.s3CoverPageURL = emergency.s3CoverPageURL;
            emergencyResult.type = 'EMERGENCY';
            emergencyResult.posts = [];
        }
        for (const row of emergency.posts) {
            const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;
            const contents: any = {};
            contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
            if (firstImage !== undefined && firstImage.s3ImageURL !== undefined) {
                try {
                    const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3ImageURL);
                    contents.coverPageSignUrl = signUrl;
                } catch (error) {
                    console.log('PostSectionProcessor: ' + error);
                }
            }
            row.isLike = false;
            contents.post = row;
            emergencyResult.posts.push(contents);
        }
        return emergencyResult;
    }
}
