/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { SectionModel } from '../models/SectionModel';
import { ContentModel } from '../models/ContentModel';
import { AbstractSectionModelProcessor } from './AbstractSectionModelProcessor';
import { FollowingRecommendProcessorData } from './data/FollowingRecommendProcessorData';
import { PostsService } from '../services/PostsService';
import { UserFollowService } from '../services/UserFollowService';
import { PLATFORM_NAME_TH } from '../../constants/SystemConfig';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import { ObjectID } from 'mongodb';
import { AssetService } from '../services/AssetService';
import { ImageUtil } from '../../utils/ImageUtil';

export class FollowingRecommendProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 5;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private postsService: PostsService,
        private userFollowService: UserFollowService,
        private assetService: AssetService
    ) {
        super();
    }

    public setData(data: FollowingRecommendProcessorData): void {
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
                let showUser = true;
                let showPage = true;
                let showUserAction = false;

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
                    if (typeof this.config.showUser === 'boolean') {
                        showUser = this.config.showUser;
                    }
                    if (typeof this.config.showPage === 'boolean') {
                        showPage = this.config.showPage;
                    }
                    if (typeof this.config.showUserAction === 'boolean') {
                        showUserAction = this.config.showUserAction;
                    }
                }

                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : limit;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;

                // get startDateTime, endDateTime
                let startDateTime: Date = undefined;
                let endDateTime: Date = undefined;
                let userId: string = undefined;

                if (this.data !== undefined && this.data !== null) {
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    userId = this.data.userId;
                }

                // if not show user or page then return undefined.
                if (!showUser && !showPage) {
                    return undefined;
                }

                // for filter startDateTime mode
                const andStmtArray = [];
                if (startDateTime !== undefined && startDateTime !== null) {
                    andStmtArray.push({ startDateTime: { $gte: startDateTime } });
                }
                if (endDateTime !== undefined && endDateTime !== null) {
                    andStmtArray.push({ startDateTime: { $lte: endDateTime } });
                }

                // search user follow to ignore it
                const pageUserFollowedIds = [];
                const userFollowedIds = [];
                if (userId !== undefined && userId !== null && userId !== '') {
                    if (showPage) {
                        const pageUserFollowed = await this.userFollowService.getFollowed(new ObjectID(userId), SUBJECT_TYPE.PAGE);
                        for (const followed of pageUserFollowed) {
                            pageUserFollowedIds.push(followed.subjectId);
                        }
                    }
                    if (showUser) {
                        const userUserFollow = await this.userFollowService.getFollowed(new ObjectID(userId), SUBJECT_TYPE.USER);
                        for (const followed of userUserFollow) {
                            userFollowedIds.push(followed.subjectId);
                        }
                    }
                }

                const postMatchStmt: any = {
                    isDraft: false,
                    deleted: false,
                    hidden: false
                };

                const pagePostMatchStmt: any = {
                    'page.banned': false,
                };

                if (searchOfficialOnly) {
                    pagePostMatchStmt['page.isOfficial'] = true;
                }

                if (pageUserFollowedIds.length > 0) {
                    postMatchStmt['page._id'] = {
                        $nin: pageUserFollowedIds
                    };
                }

                if (userFollowedIds.length > 0) {
                    postMatchStmt['ownerUser'] = {
                        $nin: userFollowedIds
                    };
                }

                // for filter startDateTime mode
                // if (andStmtArray.length > 0) {
                //     postMatchStmt['$and'] = andStmtArray;
                // }

                const postStmt = [
                    { $match: postMatchStmt },
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
                    { $match: pagePostMatchStmt }, // match page
                    { $sort: { createdDate: -1 } },
                    { $group: { _id: '$page._id', page: { $first: '$page' } } },
                    // { $skip: offset },
                    { $limit: limit }
                ];

                const postAggregateResult = await this.postsService.aggregate(postStmt);

                const result: SectionModel = new SectionModel();
                result.title = 'แนะนำให้ติดตาม';
                result.subtitle = 'พวกเขากำลังบอกเล่าบางสิ่งบางอย่างบน' + PLATFORM_NAME_TH;
                result.type = 'SMALL';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];

                const lastestDate = undefined;

                for (const row of postAggregateResult) {
                    if (row.page !== undefined) {
                        const iconSignUrl = await ImageUtil.generateAssetSignURL(this.assetService, row.page.imageURL, { prefix: '/file/' });
                        const contentModel = new ContentModel();
                        contentModel.title = '';
                        contentModel.subtitle = row.page.name;
                        contentModel.iconUrl = row.page.imageURL;
                        contentModel.iconSignUrl = iconSignUrl;
                        contentModel.data = row.page;

                        if (showUserAction) {
                            const userAction: any = await this.postsService.getUserPostAction(row._id + '', userId, true, true, true, true);
                            contentModel.isLike = userAction.isLike;
                            contentModel.isRepost = userAction.isRepost;
                            contentModel.isComment = userAction.isComment;
                            contentModel.isShare = userAction.isShare;
                        }

                        result.contents.push(contentModel);
                    } else if (row.ownerUser !== undefined) {
                        // ! follow user mode develop for the next time
                    }
                }

                result.dateTime = lastestDate;

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}