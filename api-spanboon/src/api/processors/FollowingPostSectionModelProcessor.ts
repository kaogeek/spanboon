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
export class FollowingPostSectionModelProcessor extends AbstractSeparateSectionProcessor {
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
                // get startDateTime, endDateTime
                if (this.data !== undefined && this.data !== null) {
                    userId = this.data.userId;
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
                let postIds = undefined;
                if (isReadPostIds.length > 0) {
                    for (let i = 0; i < isReadPostIds.length; i++) {
                        const mapIds = isReadPostIds[i].postId.map(ids => new ObjectID(ids));
                        postIds = mapIds;
                    }
                }
                let isFollowing = undefined;
                // const today = moment().add(month, 'month').toDate();
                if (postIds !== undefined && postIds.length > 0) {
                    isFollowing = await this.userFollowService.aggregate([
                        {
                            $match: {
                                userId: objIds
                            }
                        },
                        {
                            $lookup: {
                                from: 'Page',
                                let: { subjectId: '$subjectId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$$subjectId', '$_id']
                                            }
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: 'Posts',
                                            let: { id: '$_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $eq: ['$$id', '$pageId']
                                                        },
                                                    },
                                                },
                                                {
                                                    $match: {
                                                        _id: { $nin: postIds },
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false,
                                                    }
                                                },
                                                {
                                                    $sort: {
                                                        summationScore: -1,
                                                    },
                                                },
                                                {
                                                    $skip: offset
                                                },
                                                {
                                                    $limit: limit + offset,

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
                                as: 'page'
                            },
                        },
                        {
                            $unwind: {
                                path: '$page',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: 'User',
                                let: { subjectId: '$subjectId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$$subjectId', '$_id']
                                            }
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: 'Posts',
                                            let: { id: '$_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $eq: ['$$id', '$ownerUser']
                                                        }
                                                    }
                                                },
                                                {
                                                    $match: {
                                                        _id: { $nin: postIds },
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false,
                                                    }
                                                },
                                                {
                                                    $sort: {
                                                        createdDate: -1,
                                                    },
                                                },
                                                {
                                                    $skip: offset
                                                },
                                                {
                                                    $limit: limit + offset,

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
                                                        _id: { $nin: postIds },
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false,
                                                    }
                                                },
                                                {
                                                    $sort: {
                                                        summationScore: -1,
                                                    },
                                                },
                                                {
                                                    $skip: offset
                                                },
                                                {
                                                    $limit: limit + offset,

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
                        {
                            $lookup: {
                                from: 'PageObjective',
                                let: { subjectId: '$subjectId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$$subjectId', '$_id']
                                            }
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'Posts',
                                            let: { id: '$_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $eq: ['$$id', '$objective']
                                                        }
                                                    }
                                                },
                                                {
                                                    $match: {
                                                        _id: { $nin: postIds },
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false,
                                                    }
                                                },
                                                {
                                                    $sort: {
                                                        summationScore: -1,
                                                    },
                                                },
                                                {
                                                    $skip: offset
                                                },
                                                {
                                                    $limit: limit + offset,

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
                                as: 'pageObjective'
                            }
                        },
                        {
                            $unwind: {
                                path: '$pageObjective',
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
                                from: 'Page',
                                let: { subjectId: '$subjectId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$$subjectId', '$_id']
                                            }
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: 'Posts',
                                            let: { id: '$_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $eq: ['$$id', '$pageId']
                                                        },
                                                    },
                                                },
                                                {
                                                    $match: {
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false,
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
                                as: 'page'
                            },
                        },
                        {
                            $unwind: {
                                path: '$page',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        {
                            $lookup: {
                                from: 'User',
                                let: { subjectId: '$subjectId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$$subjectId', '$_id']
                                            }
                                        },
                                    },
                                    {
                                        $lookup: {
                                            from: 'Posts',
                                            let: { id: '$_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $eq: ['$$id', '$ownerUser']
                                                        }
                                                    }
                                                },
                                                {
                                                    $match: {
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false,
                                                    }
                                                },
                                                {
                                                    $sort: {
                                                        createdDate: -1,
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
                        {
                            $lookup: {
                                from: 'PageObjective',
                                let: { subjectId: '$subjectId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$$subjectId', '$_id']
                                            }
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'Posts',
                                            let: { id: '$_id' },
                                            pipeline: [
                                                {
                                                    $match: {
                                                        $expr: {
                                                            $eq: ['$$id', '$objective']
                                                        }
                                                    }
                                                },
                                                {
                                                    $match: {
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false,
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
                                as: 'pageObjective'
                            }
                        },
                        {
                            $unwind: {
                                path: '$pageObjective',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                    ]);
                }
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'เพราะคุณติดตาม' : this.config.title;
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = 'เพราะคุณติดตาม'; // set type by processor type
                const lastestDate = null;
                if (isFollowing.length > 0) {
                    for (const rows of isFollowing) {
                        if (rows.subjectType === 'PAGE') {
                            const contents: any = {};
                            contents.owner = {};
                            if (rows.page !== undefined) {
                                contents.owner = await this.parsePageField(rows.page, rows.page.posts);
                            }
                            result.contents.push(contents);
                        } else if (rows.subjectType === 'USER') {
                            const contents: any = {};
                            contents.owner = {};
                            contents.owner = await this.parseUserField(rows.user);
                            result.contents.push(contents);
                        } else if (rows.subjectType === 'EMERGENCY_EVENT') {
                            const contents: any = {};
                            contents.owner = {};
                            contents.owner = await this.parseEmergencyField(rows.emergencyEvent);
                            result.contents.push(contents);
                        } else if (rows.subjectType === 'OBJECTIVE') {
                            const contents: any = {};
                            contents.owner = {};
                            contents.owner = await this.parseObjectiveField(rows.pageObjective);
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
    private async parsePageField(page: any, posts: any): Promise<any> {
        const pageResult: any = {};
        if (page !== undefined) {
            pageResult.id = page._id;
            pageResult.name = page.name;
            pageResult.imageURL = page.imageURL;
            pageResult.isOfficial = page.isOfficial;
            pageResult.uniqueId = page.pageUsername;
            pageResult.type = 'PAGE';
            pageResult.posts = [];
            for (const row of posts) {
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
                pageResult.posts.push(contents);
            }
        }

        return pageResult;
    }
    private async parseUserField(user: any): Promise<any> {
        const userResult: any = {};

        if (user !== undefined) {
            userResult.id = user._id;
            userResult.displayName = user.displayName;
            userResult.imageURL = user.imageURL;
            userResult.email = user.email;
            userResult.isAdmin = user.isAdmin;
            userResult.uniqueId = user.uniqueId;
            userResult.type = 'USER';
            userResult.posts = [];

            for (const row of user.posts) {
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
                userResult.posts.push(contents);
            }

        }

        return userResult;
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

    private async parseObjectiveField(objective: any): Promise<any> {
        const objectiveResult: any = {};
        if (objective !== undefined) {
            objectiveResult.id = objective._id;
            objectiveResult.pageId = objective.pageId;
            objectiveResult.title = objective.title;
            objectiveResult.detail = objective.detail;
            objectiveResult.iconURL = objective.iconURL;
            objectiveResult.category = objective.category;
            objectiveResult.hashTag = objective.hashTag;
            objectiveResult.s3IconURL = objective.s3IconURL;
            objectiveResult.type = 'OBJECTIVE';
            objectiveResult.posts = [];
            for (const row of objective.posts) {
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
                objectiveResult.posts.push(contents);

            }
        }
        return objectiveResult;
    }
}
