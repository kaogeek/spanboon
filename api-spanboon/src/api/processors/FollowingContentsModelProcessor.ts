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
import { UserService } from '../services/UserService';
import { UserFollowService } from '../services/UserFollowService';
import { PageObjectiveService } from '../services/PageObjectiveService';
import { UserLikeService } from '../services/UserLikeService';
import { UserLike } from '../models/UserLike';
import { LIKE_TYPE } from '../../constants/LikeType';
import { ObjectID } from 'mongodb';
import { PageService } from '../services/PageService';
import { EmergencyEventService } from '../services/EmergencyEventService';
export class FollowingContentsModelProcessor extends AbstractSeparateSectionProcessor {
    private DEFAULT_SEARCH_LIMIT = 10;
    private DEFAULT_SEARCH_OFFSET = 0;
    constructor(
        // private postsService: PostsService,
        private s3Service: S3Service,
        private userLikeService: UserLikeService,
        private emergencyEventService: EmergencyEventService,
        private pageObjectiveService: PageObjectiveService,
        private userFollowService: UserFollowService,
        private userService: UserService,
        private pageService: PageService
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
                let limit: number = undefined;
                let offset: number = undefined;
                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.limit === 'number') {
                        limit = this.config.limit;
                    }

                    if (typeof this.config.offset === 'number') {
                        offset = this.config.offset;
                    }
                    /* 
                    if (typeof this.config.searchOfficialOnly === 'boolean') {
                        searchOfficialOnly = this.config.searchOfficialOnly;
                    } */
                }

                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : this.DEFAULT_SEARCH_LIMIT;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;
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
                // const today = moment().add(month, 'month').toDate();
                const isFollowing = await this.userFollowService.aggregate([
                    {
                        $match: {
                            userId: objIds
                        }
                    },
                    {
                        $project: {
                            subjectId: 1,
                            subjectType: 1,
                            _id: 0
                        }
                    },
                ]);
                // USER
                // PAGE 
                // db.Page.aggregate([{$match:{'isOfficial':true}},{'$lookup':{from:'Posts','let':{'id':'$_id'},'pipeline':[{'$match':{'$expr':{'$eq':['$$id','$pageId']}}},{$limit:1}],as:'Posts'}},{$unwind: { path: '$Posts', preserveNullAndEmptyArrays: true }}])
                // EMERGENCY_EVENT
                // OBJECTIVE
                const userIds = [];
                const pageIds = [];
                const emegencyIds = [];
                const objectiveIds = [];
                if (isFollowing.length > 0) {
                    for (let i = 0; i < isFollowing.length; i++) {
                        if (isFollowing[i].subjectType === 'USER') {
                            userIds.push((new ObjectID(isFollowing[i].subjectId)));
                        }
                        if (isFollowing[i].subjectType === 'PAGE') {
                            pageIds.push((new ObjectID(isFollowing[i].subjectId)));
                        }
                        if (isFollowing[i].subjectType === 'EMERGENCY_EVENT') {
                            emegencyIds.push((new ObjectID(isFollowing[i].subjectId)));
                        } if (isFollowing[i].subjectType === 'OBJECTIVE') {
                            objectiveIds.push((new ObjectID(isFollowing[i].subjectId)));
                        } else {
                            continue;
                        }
                    }
                }
                const allContents = [];
                if (pageIds.length > 0) {
                    const pageFollowingContents = await this.pageService.aggregate(
                        [
                            {
                                $match: {
                                    _id: { $in: pageIds },
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
                                                    $eq: ['$$id', '$pageId'],
                                                },
                                            },
                                        },
                                        {
                                            $sort: {
                                                createdDate: -1,
                                            },
                                        },
                                        {
                                            $limit: 10,
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
                                    as: 'posts',
                                },
                            },
                            {
                                $addFields: {
                                    'page.posts': '$posts',
                                },
                            },
                            {
                                $project: {
                                    posts: 0,
                                },
                            },
                        ]);
                    allContents.push(pageFollowingContents);
                }
                if (userIds.length > 0) {
                    const userFollowingContents = await this.userService.aggregate(
                        [
                            {
                                $match: {
                                    _id: { $in: userIds }
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
                                                    $eq: ['$$id', '$ownerUser']
                                                },
                                            }
                                        },
                                        {
                                            $sort: {
                                                createdDate: -1,
                                            },
                                        },
                                        {
                                            $limit: 10,
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
                            }, {
                                $addFields: {
                                    'user.posts': '$posts',
                                },
                            },
                            {
                                $project: {
                                    posts: 0
                                }
                            }
                        ]
                    );
                    allContents.push(userFollowingContents);
                }
                if (emegencyIds.length > 0) {
                    const emergencyFollowingContents = await this.emergencyEventService.aggregate(
                        [
                            {
                                $match: {
                                    _id: { $in: emegencyIds }
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
                                            $sort: {
                                                createdDate: -1,
                                            },
                                        },
                                        {
                                            $limit: 10,
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
                                },
                            },
                            {
                                $addFields: {
                                    'emergencyEvent.posts': '$posts'
                                }
                            },
                            {
                                $project: {
                                    posts: 0
                                }
                            }
                        ]
                    );
                    allContents.push(emergencyFollowingContents);
                }
                if (objectiveIds.length > 0) {
                    const objectiveFollowingContents = await this.pageObjectiveService.aggregate(
                        [
                            {
                                $match: {
                                    _id: { $in: objectiveIds }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Posts',
                                    let: { id: '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $eq: ['$$id', '$objective'] }
                                            }
                                        },
                                        {
                                            $sort: {
                                                createdDate: -1,
                                            },
                                        },
                                        {
                                            $limit: 10,
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
                                $addFields: {
                                    'pageObjective.posts': '$posts'
                                }
                            },
                            {
                                $project: {
                                    posts: 0
                                }
                            }
                        ]
                    );
                    allContents.push(objectiveFollowingContents);
                }
                const posts = [];
                const postContents = [];
                let summationScore = undefined;
                if (allContents.length > 0) {
                    for (const rows of allContents.flat()) {
                        if (rows.page !== undefined) {
                            posts.push(rows.page);
                        } else if (rows.user !== undefined) {
                            posts.push(rows.user);
                        } else if (rows.emergencyEvent !== undefined) {
                            posts.push(rows.emergencyEvent);
                        } else {
                            posts.push(rows.pageObjective);
                        }
                    }
                }
                const flatPosts = posts.flat();
                if (flatPosts.length > 0) {
                    for (const row of flatPosts) {
                        summationScore = row.posts.sort((a, b) => b.summationScore - a.summationScore);
                        if (summationScore) {
                            postContents.push(summationScore);
                        }
                    }
                }
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'เพราะคุณติดตาม' : this.config.title;
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = 'Following'; // set type by processor type
                const lastestDate = null;
                if (postContents.length > 0) {
                    for (const row of postContents.flat()) {
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;
                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3ImageURL !== undefined && firstImage.s3ImageURL !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3ImageURL);
                                contents.coverPageSignUrl = signUrl;
                            } catch (error) {
                                console.log('PostSectionProcessor: ' + error);
                            }
                        }
                        row.isLike = false;
                        if (userId !== undefined && userId !== undefined && userId !== '') {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                            if (userLikes.length > 0) {
                                row.isLike = true;
                            }
                        }
                        contents.owner = {};
                        if (row) {
                            contents.owner = await this.parsePageField(row.user);
                        }
                        contents.post = row;
                        result.contents.push(contents);
                    }
                }
                result.dateTime = lastestDate;
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
    private async parsePageField(all: any): Promise<any> {
        const pageResult: any = {};
        if (all !== undefined) {
            pageResult.id = all._id;
            pageResult.name = all.displayName;
            pageResult.imageURL = all.imageURL;
            pageResult.uniqueId = all.uniqueId;
            pageResult.type = 'All';
        }

        return pageResult;
    }
}
