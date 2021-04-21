/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { SectionModel } from '../models/SectionModel';
import { ContentModel } from '../models/ContentModel';
import { AbstractSectionModelProcessor } from './AbstractSectionModelProcessor';
import { UserRecommendProcessorData } from './data/UserRecommendProcessorData';
import { PostsService } from '../services/PostsService';
import { UserFollowService } from '../services/UserFollowService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import moment from 'moment';
import { PLATFORM_NAME_TH } from '../../constants/SystemConfig';
import { ObjectID } from 'mongodb';

export class UserRecommendSectionProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 4;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private postsService: PostsService,
        private userFollowService: UserFollowService
    ) {
        super();
    }

    public setData(data: UserRecommendProcessorData): void {
        this.data = data;
    }

    // new post which user follow
    /**
     * 1. Search UserFollow from UserId or Engagement from clientId to get Page
     * 2. Search Lastest Post from Page.
     * 3. if no userId & clientId just use any hot post
     */
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
                let userObjId: ObjectID = undefined;
                if (this.data !== undefined && this.data !== null) {
                    userId = this.data.userId;
                    clientId = this.data.clientId;
                }

                const today = moment().toDate();
                const matchStmt = {
                    isDraft: false,
                    deleted: false,
                    hidden: false,
                    startDateTime: { $lte: today }
                };
                if (userId !== undefined) {
                    // ! impl 
                } else if (clientId !== undefined) {
                    // ! impl
                }
                const postMatchStmt: any = {
                    isDraft: false,
                    deleted: false,
                    hidden: false,
                    startDateTime: { $lte: today }
                };
                const postStmt = [
                    { $match: postMatchStmt },
                    { $limit: limit },
                    { $sort: { createdDate: -1 } },
                    { $addFields: { objectiveId: { $toObjectId: '$objective' } } },
                    {
                        $lookup: {
                            from: 'PageObjective',
                            localField: 'objectiveId',
                            foreignField: '_id',
                            as: 'objectives'
                        }
                    }
                ];
                const searchResult = await this.postsService.aggregate(postStmt);

                let lastestDate = null;
                const result: SectionModel = new SectionModel();
                result.title = 'เรื่องราวที่คุณอาจพลาดไป';
                result.type = 'RECOMMEND';
                result.subtitle = 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์ม' + PLATFORM_NAME_TH;
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                for (const row of searchResult) {
                    const page = (row.page !== undefined && row.page.length > 0) ? row.page[0] : undefined;
                    const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                    const firstImg = (row.gallery !== undefined && row.gallery.length > 0) ? row.gallery[0] : undefined;

                    if (lastestDate === null) {
                        lastestDate = row.createdDate;
                    }

                    // let contentTitle = '';
                    let iconURL = '';
                    let followUserCount = 0;
                    const followUsers = [];
                    let isHot = false;
                    if (page !== undefined) {
                        const folStmt = { subjectId: page._id, subjectType: SUBJECT_TYPE.PAGE };
                        followUserCount = await this.userFollowService.search(undefined, undefined, undefined, undefined, folStmt, undefined, true);
                        // contentTitle = page.name;
                        iconURL = page.imageURL;
                        // mock data to mark flag hot.
                        if (page.isOfficial) {
                            isHot = true;
                        }

                        const folFiveStmt = [
                            { $match: { subjectId: page._id, subjectType: SUBJECT_TYPE.PAGE } },
                            { $sample: { size: 5 } },
                            {
                                $lookup: {
                                    from: 'User',
                                    localField: 'userId',
                                    foreignField: '_id',
                                    as: 'user'
                                }
                            }
                        ];
                        const folFive = await this.userFollowService.aggregate(folFiveStmt);
                        for (const fol of folFive) {
                            followUsers.push(this.parseUserField(fol.user[0]));
                        }
                    } else if (user !== undefined) {
                        const folStmt = { subjectId: user._id, subjectType: SUBJECT_TYPE.USER };
                        followUserCount = await this.userFollowService.search(undefined, undefined, undefined, undefined, folStmt, undefined, true);
                        // contentTitle = user.displayName;
                        iconURL = user.imageURL;

                        const folFiveStmt = [
                            { $match: { subjectId: user._id, subjectType: SUBJECT_TYPE.USER } },
                            { $sample: { size: 5 } },
                            {
                                $lookup: {
                                    from: 'User',
                                    localField: 'userId',
                                    foreignField: '_id',
                                    as: 'user'
                                }
                            }
                        ];
                        const folFive = await this.userFollowService.aggregate(folFiveStmt);
                        for (const fol of folFive) {
                            followUsers.push(this.parseUserField(fol.user[0]));
                        }
                    }

                    const contentModel = new ContentModel();
                    contentModel.title = row.title;
                    contentModel.iconUrl = iconURL;
                    contentModel.commentCount = row.commentCount;
                    contentModel.repostCount = row.repostCount;
                    contentModel.shareCount = row.shareCount;
                    contentModel.likeCount = row.likeCount;
                    contentModel.viewCount = row.viewCount;
                    contentModel.followUserCount = followUserCount; // count all userfollow
                    contentModel.followUsers = followUsers; // !add all userFollow // max 5
                    contentModel.post = row;
                    contentModel.dateTime = row.createdDate;

                    if (firstImg) {
                        contentModel.coverPageUrl = firstImg.imageURL;
                    }

                    if (row.rootReferencePost !== undefined) {
                        const rootRefPost = (row.rootRefPost !== undefined && row.rootRefPost.length > 0) ? row.rootRefPost[0] : undefined;
                        const rootRefFirstImg = (row.rootRefGallery !== undefined && row.rootRefGallery.length > 0) ? row.rootRefGallery[0] : undefined;
                        if (rootRefPost) {
                            contentModel.title = rootRefPost.title;
                        }
                        if (rootRefFirstImg) {
                            contentModel.coverPageUrl = rootRefFirstImg.imageURL;
                        }
                        contentModel.rootReferencePost = rootRefPost;
                        this.removePostField(contentModel.rootReferencePost);
                    }

                    if (showUserAction) {
                        const userAction: any = await this.postsService.getUserPostAction(row._id, userId, true, true, true, true);
                        contentModel.isLike = userAction.isLike;
                        contentModel.isRepost = userAction.isRepost;
                        contentModel.isComment = userAction.isComment;
                        contentModel.isShare = userAction.isShare;
                    }

                    contentModel.owner = {};
                    if (page !== null && page !== undefined) {
                        contentModel.owner = this.parsePageField(page);
                        contentModel.owner.isHot = isHot;

                        if (userId !== null && userId !== undefined && userId !== '') {
                            userObjId = new ObjectID(userId);

                            const currentUserFollowStmt = { userId: userObjId, subjectId: page._id, subjectType: SUBJECT_TYPE.PAGE };
                            const currentUserFollow = await this.userFollowService.findOne(currentUserFollowStmt);

                            if (currentUserFollow !== null && currentUserFollow !== undefined) {
                                contentModel.isFollow = true;
                            } else {
                                contentModel.isFollow = false;
                            }
                        } else {
                            contentModel.isFollow = false;
                        }
                    } else if (user !== null && user !== undefined) {
                        contentModel.owner = this.parseUserField(user);
                    }

                    this.removePostField(contentModel.post);

                    result.contents.push(contentModel);
                }
                result.dateTime = lastestDate;

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    private removePostField(post: any): any {
        if (post === undefined || post === null) {
            return post;
        }

        delete post.story;
        delete post.page;
        delete post.user;
        delete post.gallery;
        delete post.rootRefPost;
        delete post.rootRefGallery;

        return post;
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
