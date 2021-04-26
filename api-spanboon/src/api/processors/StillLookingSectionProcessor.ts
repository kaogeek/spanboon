/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { AbstractSectionModelProcessor } from './AbstractSectionModelProcessor';
import { LastestSectionProcessorData } from './data/LastestSectionProcessorData';
import { SectionModel } from '../models/SectionModel';
import { ContentModel } from '../models/ContentModel';
import { PostsService } from '../services/PostsService';
import { NeedsService } from '../services/NeedsService';
import { UserFollowService } from '../services/UserFollowService';
import { SUBJECT_TYPE } from '../../constants/FollowType';
import moment from 'moment';
import { ObjectID } from 'mongodb';

export class StillLookingSectionProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 4;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private postsService: PostsService,
        private needsService: NeedsService,
        private userFollowService: UserFollowService,
    ) {
        super();
    }

    public setData(data: LastestSectionProcessorData): void {
        this.data = data;
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get data
                let userId: string = undefined;
                let userObjId: ObjectID = undefined;

                if (this.data !== undefined && this.data !== null) {
                    userId = this.data.userId;
                }

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

                const needStmt = [
                    { $group: { '_id': { 'post': '$post' } } },
                    { $sort: { createdDate: 1 } },
                    { $skip: offset },
                    { $limit: limit }
                ];
                const postIds: any[] = [];
                const needSearchResult = await this.needsService.aggregateEntity(needStmt);
                for (const row of needSearchResult) {
                    postIds.push(row.id.post);
                }

                const today = moment().toDate();
                const postStmt = [
                    { $match: { _id: { $in: postIds }, isDraft: false, deleted: false, hidden: false, startDateTime: { $lte: today } } },
                    {
                        $lookup: {
                            from: 'Page',
                            localField: 'pageId',
                            foreignField: '_id',
                            as: 'page'
                        }
                    }
                ];
                const searchResult = await this.postsService.aggregate(postStmt);

                // count all post that has need
                const needPostCountStmt = [
                    { $group: { '_id': { 'post': '$post' }, 'count': { $sum: 1 } } },
                    { $match: { 'count': { $gt: 0 } } },
                    { $count: 'count' }
                ];
                const allPosthasNeed = await this.needsService.aggregate(needPostCountStmt);
                const countAllResult = (allPosthasNeed && allPosthasNeed.length > 0) ? allPosthasNeed[0].count : 0;

                let lastestDate = null;
                const result: SectionModel = new SectionModel();
                result.title = 'ยังมองหาอยู่';
                result.subtitle = 'กำลังมองหา';
                result.type = 'STILLLOOKING';
                result.description = '';
                result.iconUrl = '';
                result.contentCount = countAllResult;
                result.contents = [];
                for (const row of searchResult) {
                    const pageString = (row.pageId) ? row.pageId + '' : undefined;
                    if (pageString === undefined) {
                        continue;
                    }
                    const page = (row.page.length > 0) ? row.page[0] : undefined;

                    if (lastestDate === null) {
                        lastestDate = row.createdDate;
                    }

                    const contentModel = new ContentModel();

                    if (page !== null && page !== undefined) {
                        const folStmt = { subjectId: page._id, subjectType: SUBJECT_TYPE.PAGE };
                        const followUserCount = await this.userFollowService.search(undefined, undefined, undefined, undefined, folStmt, undefined, true);

                        contentModel.commentCount = row.commentCount;
                        contentModel.repostCount = row.repostCount;
                        contentModel.shareCount = row.shareCount;
                        contentModel.likeCount = row.likeCount;
                        contentModel.viewCount = row.viewCount;
                        contentModel.followUserCount = followUserCount; // count all userfollow
                        contentModel.post = row;
                        contentModel.dateTime = row.createdDate;
                        contentModel.owner = this.parsePageField(page);

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
                    }

                    if (showUserAction) {
                        const userAction: any = await this.postsService.getUserPostAction(row._id, userId, true, true, true, true);
                        contentModel.isLike = userAction.isLike;
                        contentModel.isRepost = userAction.isRepost;
                        contentModel.isComment = userAction.isComment;
                        contentModel.isShare = userAction.isShare;
                    }

                    delete contentModel.post.story;
                    delete contentModel.post.page;

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
}
