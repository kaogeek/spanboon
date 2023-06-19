/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { AbstractSeparateSectionProcessor } from './AbstractSeparateSectionProcessor';
import { SectionModel } from '../models/SectionModel';
import { PostsService } from '../services/PostsService';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { S3Service } from '../services/S3Service';
import { UserLikeService } from '../services/UserLikeService';
import { PageService } from '../services/PageService';
import { UserService } from '../services/UserService';
import { UserLike } from '../models/UserLike';
import { LIKE_TYPE } from '../../constants/LikeType';
import { ObjectID } from 'mongodb';

export class FollowingProvinceSectionModelProcessor extends AbstractSeparateSectionProcessor {
    private DEFAULT_SEARCH_LIMIT = 8;
    private DEFAULT_SEARCH_OFFSET = 0;
    constructor(
        private postsService: PostsService,
        private s3Service: S3Service,
        private userLikeService: UserLikeService,
        private userService: UserService,
        private pageService: PageService
    ) {
        super();
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                let searchOfficialOnly: number = undefined;
                let userId = undefined;
                let isReadPostIds = undefined;
                // get startDateTime, endDateTime
                let startDateTime: Date = undefined;

                if (this.data !== undefined && this.data !== null) {
                    startDateTime = this.data.startDateTime;
                    userId = this.data.userId;
                    isReadPostIds = this.data.postIds;

                }
                const objIds = new ObjectID(userId);
                const dateFormat = new Date(startDateTime);
                const dateReal = dateFormat.setDate(dateFormat.getDate() - 7);
                const toDate = new Date(dateReal);
                let limit: number = undefined;
                let offset: number = undefined;
                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.limit === 'number') {
                        limit = this.config.limit;
                    }

                    if (typeof this.config.offset === 'number') {
                        offset = this.config.offset;
                    }
                    if (typeof this.config.searchOfficialOnly === 'boolean') {
                        searchOfficialOnly = this.config.searchOfficialOnly;
                    }
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
                let postIds = undefined;
                if (isReadPostIds.length > 0) {
                    for (let i = 0; i < isReadPostIds.length; i++) {
                        const mapIds = isReadPostIds[i].postId.map(ids => new ObjectID(ids));
                        postIds = mapIds;
                    }
                }
                
                // const today = moment().add(month, 'month').toDate();
                const pageId = [];
                const userProvince = await this.userService.aggregate(
                    [
                        {
                            $match: {
                                _id: objIds,
                            }
                        },
                        {
                            $project: {
                                province: 1,
                                _id: 0
                            }
                        }
                    ]
                );
                let pageProvince = undefined;
                if (userProvince.length > 0) {
                    pageProvince = await this.pageService.aggregate([
                        {
                            $match: {
                                isOfficial: true,
                                province: userProvince[0].province
                            }
                        },
                    ]);
                    if (pageProvince.length > 0) {
                        for (let i = 0; i < pageProvince.length; i++) {
                            pageId.push(new ObjectID(pageProvince[i]._id));
                        }
                    }
                }
                // USER
                // PAGE
                // EMERGENCY_EVENT
                // OBJECTIVE
                let postMatchStmt: any = undefined;
                if (postIds !== undefined && postIds.length > 0) {
                    postMatchStmt = {
                        isDraft: false,
                        deleted: false,
                        hidden: false,
                        startDateTime: { $lte: startDateTime, $gte: toDate },
                        pageId: { $in: pageId },
                        _id: { $nin: postIds }
                    };
                } else {
                    postMatchStmt = {
                        isDraft: false,
                        deleted: false,
                        hidden: false,
                        startDateTime: { $lte: startDateTime, $gte: toDate },
                        pageId: { $in: pageId },
                    };
                }
                const postStmt = [
                    { $match: postMatchStmt },
                    { $sort: { createdDate: -1 } },
                    {
                        $lookup:
                        {
                            from: 'Page',
                            let: { 'pageId': '$pageId' },
                            pipeline: [{ $match: { $expr: { $eq: ['$_id', '$$pageId'] } } },
                            { $project: { email: 0 } }
                            ],
                            as: 'page'
                        }
                    },
                    {
                        '$limit': limit
                    },
                    {
                        $unwind: {
                            path: '$page',
                            preserveNullAndEmptyArrays: true
                        }
                    },
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
                            as: 'gallery'
                        }
                    },
                    {
                        $lookup: {
                            from: 'User',
                            localField: 'ownerUser',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $project: {
                            story: 0
                        }

                    },
                ];
                if (searchOfficialOnly) {
                    postStmt.splice(3, 0, { $match: { 'page.isOfficial': true, 'page.banned': false } });
                }
                const postAggregate = await this.postsService.aggregate(postStmt);
                const lastestDate = null;
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'ก้าวไกล' + userProvince[0].province : this.config.title;
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = 'FollowingProvince'; // set type by processor type
                for (const row of postAggregate) {
                    const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
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

                    // search isLike
                    row.isLike = false;
                    if (userId !== undefined && userId !== undefined && userId !== '') {
                        const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                        if (userLikes.length > 0) {
                            row.isLike = true;
                        }
                    }

                    contents.owner = {};
                    if (row.page !== undefined) {
                        contents.owner = this.parsePageField(row.page);
                    } else {
                        contents.owner = this.parseUserField(user);
                    }
                    // remove page agg
                    // delete row.page;
                    delete row.user;
                    contents.post = row;
                    result.contents.push(contents);
                }
                result.dateTime = lastestDate;

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
    private parsePageField(page: any): any {
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

    private parseUserField(user: any): any {
        const userResult: any = {};

        if (user !== undefined) {
            userResult.id = user._id;
            userResult.displayName = user.displayName;
            userResult.imageURL = user.imageURL;
            userResult.email = user.email;
            userResult.isAdmin = user.isAdmin;
            userResult.uniqueId = user.uniqueId;
            userResult.type = 'USER';
        }

        return userResult;
    }
}
