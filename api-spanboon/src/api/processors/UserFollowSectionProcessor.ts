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
import { ObjectID } from 'mongodb';
import moment from 'moment';

export class UserFollowSectionProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 2;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private postsService: PostsService,
        private userFollowService: UserFollowService,
        private pageService: PageService
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
                }

                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : limit;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;

                let userId = undefined;
                let clientId = undefined;
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

                const matchStmt = lastestFilter.whereConditions;
                const postStmt = [
                    { $match: matchStmt },
                    { $limit: limit },
                    { $skip: offset },
                    { $sort: { createdDate: -1 } },
                    {
                        $lookup: {
                            from: 'Page',
                            localField: 'pageId',
                            foreignField: '_id',
                            as: 'page'
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
                        $lookup: {
                            from: 'PostsGallery',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'gallery'
                        }
                    }
                ];
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
                result.subtitle = 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์มสะพานบุญ';
                result.description = '';
                result.contents = [];
                for (const row of searchResult) {
                    const rowPage = (row.page !== undefined && row.page.length > 0) ? row.page[0] : undefined;
                    const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                    const firstImg = (row.gallery !== undefined && row.gallery.length > 0) ? row.gallery[0] : undefined;

                    if (lastestDate === null) {
                        lastestDate = row.createdDate;
                    }

                    let followUserCount = 0;
                    let followUsers = [];
                    if (page !== undefined) {
                        const pfSimple = await this.userFollowService.sampleUserFollow(rowPage._id, SUBJECT_TYPE.PAGE, 5);
                        followUserCount = pfSimple.count;
                        followUsers = pfSimple.followers;
                    } else if (user !== undefined) {
                        const usrSimple = await this.userFollowService.sampleUserFollow(user._id, SUBJECT_TYPE.USER, 5);
                        followUserCount = usrSimple.count;
                        followUsers = usrSimple.followers;
                    }

                    const contentModel = new ContentModel();
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
                    }

                    if (showUserAction) {
                        const userAction: any = await this.postsService.getUserPostAction(row._id, userId, true, true, true, true);
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
