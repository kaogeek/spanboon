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
export class PageFollowingPostSectionModelProcessor extends AbstractSeparateSectionProcessor {
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
                let hidePostIds: any = undefined;
                // get startDateTime, endDateTime
                if (this.data !== undefined && this.data !== null) {
                    userId = this.data.userId;
                    startDateTime = this.data.startDateTime;
                    isReadPostIds = this.data.postIds;
                    hidePostIds = this.data.hidePost;

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
                if (hidePostIds.length > 0) {
                    for (let j = 0; j < hidePostIds.length; j++) {
                        const postId = hidePostIds[j].postId;
                        if (postId !== undefined && postId !== null && postId.length > 0) {
                            postIds.push(...postId.map(id => new ObjectID(id)));
                        }
                    }
                }

                const postMatchStmt: any = {
                    isDraft: false,
                    deleted: false,
                    hidden: false,
                    startDateTime: { $lte: startDateTime },
                };
                if (postIds.length > 0) {
                    postMatchStmt._id = { $nin: postIds.flat() };
                }

                // const today = moment().add(month, 'month').toDate();
                const isFollowing = await this.userFollowService.aggregate([
                    {
                        $match: {
                            userId: objIds,
                            subjectType: 'PAGE'
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
                                                },
                                            },
                                            {
                                                $match: postMatchStmt
                                            },
                                            {
                                                $sort: {
                                                    summationScore: -1,
                                                },
                                            },
                                            {
                                                $limit: limit,

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
                                },
                                {
                                    $match: {
                                        posts: { $ne: [] }
                                    }
                                },
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
                ]);
                const postFilter = [];
                if (isFollowing.length > 0) {
                    for (let j = 0; j < isFollowing.length; j++) {
                        if (isFollowing[j].page !== undefined) {
                            postFilter.push(isFollowing[j]);
                        } else {
                            continue;
                        }
                    }
                }
                let summationScore = undefined;
                if (postFilter.length > 1) {
                    summationScore = postFilter.sort((a, b) => b.page.posts[0].summationScore - a.page.posts[0].summationScore);
                } else {
                    summationScore = postFilter;
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
                        if (rows.subjectType === 'PAGE') {
                            const contents: any = {};
                            contents.owner = {};
                            if (rows.page !== undefined) {
                                contents.owner = await this.parsePageField(rows.page, rows.page.posts);
                            }
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

}
