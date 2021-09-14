/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { SectionModel } from '../models/SectionModel';
import { ContentModel } from '../models/ContentModel';
import { UserFollow } from '../models/UserFollow';
import { AbstractSectionModelProcessor } from './AbstractSectionModelProcessor';
import { UserFollowProcessorData } from './data/UserFollowProcessorData';
import { PostsService } from '../services/PostsService';
import { UserFollowService } from '../services/UserFollowService';
import { PageService } from '../services/PageService';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { S3Service } from '../services/S3Service';
import { ObjectID } from 'mongodb';
import moment from 'moment';
import { PLATFORM_NAME_TH } from '../../constants/SystemConfig';

export class UserFollowSectionProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 2;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private postsService: PostsService,
        private userFollowService: UserFollowService,
        private pageService: PageService,
        private s3Service: S3Service
    ) {
        super();
    }

    public setData(data: UserFollowProcessorData): void {
        this.data = data;
    }

    // new post which user follow
    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                let limit: number = undefined;
                let offset: number = undefined;
                let searchOfficialOnly: number = undefined;
                let showUserAction = false;

                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.limit === 'number') {
                        limit = this.config.limit;
                    }

                    if (typeof this.config.offset === 'number') {
                        offset = this.config.offset;
                    }

                    if (typeof this.config.showUserAction === 'boolean') {
                        showUserAction = this.config.showUserAction;
                    }

                    if (typeof this.config.searchOfficialOnly === 'boolean') {
                        searchOfficialOnly = this.config.searchOfficialOnly;
                    }
                }

                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : limit;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;

                // get startDateTime, endDateTime
                let startDateTime: Date = undefined;
                let endDateTime: Date = undefined;
                if (this.data !== undefined && this.data !== null) {
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                }

                let userId = undefined;
                let clientId = undefined;
                let userObjId: ObjectID = undefined;
                if (this.data !== undefined && this.data !== null) {
                    userId = this.data.userId;
                    clientId = this.data.clientId;
                }

                let pageFollow: UserFollow = undefined;
                let searchResult: any[] = [];
                if (userId !== undefined) {
                    const followStmt = [
                        { $match: { userId: new ObjectID(userId + '') } },
                        { $sample: { size: 1 } }
                    ];
                    const followSearchResult = await this.userFollowService.aggregate(followStmt);
                    if (followSearchResult.length > 0) {
                        pageFollow = followSearchResult[0];
                    }
                } else if (clientId !== undefined) {
                    // ! impl
                }

                const lastestFilter: SearchFilter = new SearchFilter();
                lastestFilter.limit = limit;
                lastestFilter.offset = offset;
                lastestFilter.orderBy = {
                    createdDate: 'DESC'
                };

                let page;
                if (pageFollow !== undefined) {
                    if (pageFollow.subjectType === SUBJECT_TYPE.USER) {
                        lastestFilter.whereConditions = {
                            pageId: { $eq: null },
                            ownerUser: new ObjectID(pageFollow.subjectId + '')
                        };
                    } else if (pageFollow.subjectType === SUBJECT_TYPE.PAGE) {
                        lastestFilter.whereConditions = {
                            pageId: new ObjectID(pageFollow.subjectId + '')
                        };

                        page = await this.pageService.findOne(new ObjectID(pageFollow.subjectId + ''));
                    }
                }

                const today = moment().toDate();
                if (lastestFilter.whereConditions === undefined) {
                    lastestFilter.whereConditions = {};
                }
                lastestFilter.whereConditions.isDraft = false;
                lastestFilter.whereConditions.deleted = false;
                lastestFilter.whereConditions.hidden = false;
                lastestFilter.whereConditions.startDateTime = { $lte: today };

                // overide start datetime
                const dateTimeAndArray = [];
                if (startDateTime !== undefined && startDateTime !== null) {
                    dateTimeAndArray.push({ startDateTime: { $gte: startDateTime } });
                }
                if (endDateTime !== undefined && endDateTime !== null) {
                    dateTimeAndArray.push({ startDateTime: { $lte: endDateTime } });
                }

                if (dateTimeAndArray.length > 0) {
                    lastestFilter.whereConditions['$and'] = dateTimeAndArray;
                } else {
                    // default if startDateTime and endDateTime is not defined.
                    lastestFilter.whereConditions.startDateTime = { $lte: today };
                }

                const matchStmt = lastestFilter.whereConditions;
                const postStmt = [
                    { $match: matchStmt },
                    {
                        $lookup: {
                            from: 'Page',
                            localField: 'pageId',
                            foreignField: '_id',
                            as: 'page'
                        }
                    },
                    {
                        $unwind: {
                            path: '$page',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { $sample: { size: limit } }, // random post
                    { $sort: { createdDate: -1 } },
                    { $skip: offset },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: 'User',
                            localField: 'ownerUser',
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
                        $lookup: {
                            from: 'PostsGallery',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'gallery'
                        }
                    },
                    {
                        $project: {
                            'user.password': 0,
                            'user.coverPosition': 0,
                            'user.birthdate': 0,
                            'user.coverURL': 0,
                            'user.username': 0
                        }
                    }
                ];

                // overide search Official
                if (searchOfficialOnly) {
                    postStmt.splice(3, 0, { $match: { 'page.isOfficial': true, 'page.banned': false } });
                }

                searchResult = await this.postsService.aggregate(postStmt);

                let lastestDate = null;
                const result: SectionModel = new SectionModel();
                result.title = 'โพสต์ที่แนะนำสำหรับคุณ';
                result.iconUrl = '';
                if (page) {
                    result.title = 'เพราะคุณติดตาม' + ' "' + page.name + '"';
                    result.iconUrl = (page.imageURL) ? page.imageURL : '';
                    result.data = {
                        name: page.name,
                        uniqueId: page.pageUsername
                    };
                }
                result.subtitle = 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์ม' + PLATFORM_NAME_TH;
                result.description = '';
                result.contents = [];
                for (const row of searchResult) {
                    const rowPage = row.page;
                    const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                    const firstImg = (row.gallery !== undefined && row.gallery.length > 0) ? row.gallery[0] : undefined;

                    if (lastestDate === null) {
                        lastestDate = row.createdDate;
                    }

                    const contentModel = new ContentModel();
                    let followUserCount = 0;
                    let followUsers = [];
                    if (page !== null && page !== undefined) {
                        const pfSimple = await this.userFollowService.sampleUserFollow(rowPage._id, SUBJECT_TYPE.PAGE, 5);
                        followUserCount = pfSimple.count;
                        followUsers = pfSimple.followers;

                        if (userId !== null && userId !== undefined && userId !== '') {
                            userObjId = new ObjectID(userId);

                            const currentUserFollowStmt = { userId: userObjId, subjectId: page.id, subjectType: SUBJECT_TYPE.PAGE };
                            const currentUserFollow = await this.userFollowService.findOne(currentUserFollowStmt);

                            if (currentUserFollow !== null && currentUserFollow !== undefined) {
                                contentModel.isFollow = true;
                            } else {
                                contentModel.isFollow = false;
                            }
                        }
                    } else if (user !== null && user !== undefined) {
                        const usrSimple = await this.userFollowService.sampleUserFollow(user._id, SUBJECT_TYPE.USER, 5);
                        followUserCount = usrSimple.count;
                        followUsers = usrSimple.followers;
                    } else {
                        contentModel.isFollow = false;
                    }

                    contentModel.commentCount = row.commentCount;
                    contentModel.repostCount = row.repostCount;
                    contentModel.shareCount = row.shareCount;
                    contentModel.likeCount = row.likeCount;
                    contentModel.viewCount = row.viewCount;
                    contentModel.post = row;
                    contentModel.dateTime = row.createdDate;
                    contentModel.followUserCount = followUserCount; // count all userfollow
                    contentModel.followUsers = followUsers; // add all userFollow // max 5

                    if (firstImg) {
                        contentModel.coverPageUrl = firstImg.imageURL;

                        if (firstImg.s3FilePath !== undefined && firstImg.s3FilePath !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImg.s3FilePath);
                                contentModel.coverPageSignUrl = signUrl;
                            } catch (error) {
                                console.log('UserFollowSectionProcessor: ' + error);
                            }
                        }
                    }

                    if (showUserAction) {
                        const userAction: any = await this.postsService.getUserPostAction(row._id + '', userId, true, true, true, true);
                        contentModel.isLike = userAction.isLike;
                        contentModel.isRepost = userAction.isRepost;
                        contentModel.isComment = userAction.isComment;
                        contentModel.isShare = userAction.isShare;
                    }

                    delete contentModel.post.story;

                    contentModel.owner = {};
                    if (rowPage !== undefined) {
                        contentModel.owner = this.parsePageField(rowPage);
                    } else if (user !== undefined) {
                        contentModel.owner = this.parseUserField(user);
                    }

                    result.contents.push(contentModel);
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
