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
import { ObjectID } from 'mongodb';
export class FollowingContentsModelProcessor extends AbstractSeparateSectionProcessor {
    private DEFAULT_SEARCH_LIMIT = 10;
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
                // get startDateTime, endDateTime
                if (this.data !== undefined && this.data !== null) {
                    userId = this.data.userId;
                }
                const objIds = new ObjectID(userId);
                let isReadPostIds = undefined;
                let limit: number = undefined;
                let offset: number = undefined;
                if (this.data !== undefined && this.data !== null) {
                    offset = this.data.offsets;
                    isReadPostIds = this.data.postIds;
                }
                limit = (limit === undefined || limit === null) ? this.data.limits : this.DEFAULT_SEARCH_LIMIT;
                offset = this.data.offsets ? this.data.offsets : this.DEFAULT_SEARCH_OFFSET;
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

                // const today = moment().add(month, 'month').toDate();
                let isFollowing = undefined;
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
                                        }
                                    },
                                    {
                                        $match: {
                                            isOfficial: true
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
                                                            $eq: ['$$id', '$pageId']
                                                        },
                                                        _id: { $nin: postIds.flat() },
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false
                                                    }
                                                },
                                                {
                                                    $sort: {
                                                        summationScore: -1
                                                    }
                                                },
                                                {
                                                    $skip: offset
                                                },
                                                {
                                                    $limit: limit
                                                },
                                                {
                                                    $lookup: {
                                                        from: 'PostsGallery',
                                                        localField: '_id',
                                                        foreignField: 'post',
                                                        as: 'gallery'
                                                    }
                                                },
                                                {
                                                    $lookup: {
                                                        from: 'User',
                                                        let: { ownerUser: '$ownerUser' },
                                                        pipeline: [
                                                            {
                                                                $match: {
                                                                    $expr: { $eq: ['$$ownerUser', '$_id'] }
                                                                }
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
                                                }
                                            ],
                                            as: 'posts'
                                        }
                                    },
                                ],
                                as: 'page'
                            },

                        },
                        {
                            $addFields: {
                                page: {
                                    $map: {
                                        input: '$page',
                                        in: {
                                            $mergeObjects: [
                                                '$$this',
                                                {
                                                    posts: {
                                                        $cond: {
                                                            if: { $isArray: '$$this.posts' },
                                                            then: {
                                                                $slice: [
                                                                    '$$this.posts', // Specify the array to slice
                                                                    0, // Number of elements to return
                                                                    limit // Starting position (optional)
                                                                ]
                                                            },
                                                            else: '$$this.posts'
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        },

                        {
                            $unwind: {
                                path: '$page',
                                preserveNullAndEmptyArrays: true
                            }
                        },

                        {
                            $unwind: {
                                path: '$page.posts',
                                preserveNullAndEmptyArrays: true
                            }
                        },

                        {
                            $sort: {
                                'page.posts.summationScore': -1 // Sort in descending order
                            }
                        },

                        {
                            $limit: 5
                        }
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
                                        }
                                    },
                                    {
                                        $match: {
                                            isOfficial: true
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
                                                            $eq: ['$$id', '$pageId']
                                                        },
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false
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
                                                    $limit: limit,

                                                },
                                                {
                                                    $lookup: {
                                                        from: 'PostsGallery',
                                                        localField: '_id',
                                                        foreignField: 'post',
                                                        as: 'gallery'
                                                    }
                                                },
                                                {
                                                    $lookup: {
                                                        from: 'User',
                                                        let: { ownerUser: '$ownerUser' },
                                                        pipeline: [
                                                            {
                                                                $match: {
                                                                    $expr: { $eq: ['$$ownerUser', '$_id'] }
                                                                }
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
                                                }
                                            ],
                                            as: 'posts'
                                        }
                                    }
                                ],
                                as: 'page'
                            }
                        },
                        {
                            $addFields: {
                                page: {
                                    $map: {
                                        input: '$page',
                                        in: {
                                            $mergeObjects: [
                                                '$$this',
                                                {
                                                    posts: {
                                                        $cond: {
                                                            if: { $isArray: '$$this.posts' },
                                                            then: {
                                                                $slice: [
                                                                    '$$this.posts', // Specify the array to slice
                                                                    0, // Number of elements to return
                                                                    limit // Starting position (optional)
                                                                ]
                                                            },
                                                            else: '$$this.posts'
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            }
                        },

                        {
                            $unwind: {
                                path: '$page',
                                preserveNullAndEmptyArrays: true
                            }
                        },

                        {
                            $unwind: {
                                path: '$page.posts',
                                preserveNullAndEmptyArrays: true
                            }
                        },

                        {
                            $sort: {
                                'page.posts.summationScore': -1 // Sort in descending order
                            }
                        },

                        {
                            $limit: 5
                        }
                    ]);
                }

                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'ข่าวสารก่อนหน้านี้' : this.config.title;
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = 'ข่าวสารก่อนหน้านี้'; // set type by processor type
                const lastestDate = null;
                if (isFollowing.length > 0) {
                    for (const rows of isFollowing) {
                        if (rows.subjectType === 'PAGE' && rows.page !== undefined && rows.page.posts !== undefined) {
                            const contents: any = {};
                            contents.owner = {};
                            const firstImage = (rows.page.posts.gallery.length > 0) ? rows.page.posts.gallery[0] : undefined;
                            contents.coverPageUrl = (rows.page.posts.gallery.length > 0) ? rows.page.posts.gallery[0].imageURL : undefined;
                            if (firstImage !== undefined && firstImage.s3ImageURL !== undefined) {
                                try {
                                    const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3ImageURL);
                                    contents.coverPageSignUrl = signUrl;
                                } catch (error) {
                                    console.log('PostSectionProcessor: ' + error);
                                }
                            }
                            if (rows.page !== undefined) {
                                contents.owner = await this.parsePageField(rows.page);
                            }
                            contents.post = rows.page.posts;
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
    private async parsePageField(page: any): Promise<any> {
        const pageResult: any = {};
        if (page !== undefined) {
            pageResult.id = page._id;
            pageResult.name = page.name;
            pageResult.imageURL = page.imageURL;
            pageResult.isOfficial = page.isOfficial;
            pageResult.uniqueId = page.pageUsername;
            pageResult.type = 'PAGE';
        }

        return pageResult;
    }
}
