/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { SectionModel } from '../models/SectionModel';
import { ContentModel } from '../models/ContentModel';
import { AbstractSectionModelProcessor } from './AbstractSectionModelProcessor';
import { LastestObjectiveProcessorData } from './data/LastestObjectiveProcessorData';
import { PageObjectiveService } from '../services/PageObjectiveService';
import { UserFollowService } from '../services/UserFollowService';
import { PLATFORM_NAME_TH } from '../../constants/SystemConfig';
import { PostsService } from '../services/PostsService';
import { ObjectID } from 'mongodb';
// import moment from 'moment';

export class LastestObjectiveProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 5;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private pageObjectiveService: PageObjectiveService,
        private userFollowService: UserFollowService,
        private postsService: PostsService,
    ) {
        super();
    }

    public setData(data: LastestObjectiveProcessorData): void {
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

                let userId = undefined;
                let clientId = undefined;
                if (this.data !== undefined && this.data !== null) {
                    userId = this.data.userId;
                    clientId = this.data.clientId;
                }

                const pageFollowIds: any[] = [];
                if (userId !== undefined && userId !== '') {
                    const followStmt: any[] = [
                        { $match: { userId: new ObjectID(userId + '') } },
                        { $sample: { size: 5 } },
                        {
                            $lookup: {
                                from: 'Page',
                                localField: 'subjectId',
                                foreignField: '_id',
                                as: 'page'
                            }
                        }
                    ];

                    if (searchOfficialOnly) {
                        followStmt.push({ $match: { 'page.isOfficial': true, 'page.banned': false } });
                    }

                    const followSearchResult = await this.userFollowService.aggregate(followStmt);
                    for (const ff of followSearchResult) {
                        if (ff.page[0] === undefined) {
                            continue;
                        }
                        pageFollowIds.push(ff.page[0]._id);
                    }
                } else if (clientId !== undefined) {
                    // ! impl
                }

                const matchStmt: any = {
                };

                if (pageFollowIds.length > 0) {
                    matchStmt.pageId = {
                        $in: pageFollowIds
                    };
                }

                const pageObjStmt = [
                    { $match: matchStmt },
                    { $sort: { createdDate: -1 } },
                    { // sample post for one
                        $lookup: {
                            from: 'Posts',
                            let: { 'id': '$_id' },
                            pipeline: [
                                { $match: { $expr: { $eq: ['$$id', '$objective'] } } },
                                { $limit: 1 }
                            ],
                            as: 'samplePost'
                        }
                    },
                    {
                        $match: {
                            'samplePost.0': { $exists: true }
                        }
                    },
                    { $skip: offset },
                    { $limit: limit },
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
                            from: 'HashTag',
                            localField: 'hashTag',
                            foreignField: '_id',
                            as: 'hashTagObj'
                        }
                    }
                ];

                if (searchOfficialOnly) {
                    pageObjStmt.splice(7, 0, { $match: { 'page.isOfficial': true, 'page.banned': false } });
                }

                const searchResult = await this.pageObjectiveService.aggregate(pageObjStmt);

                let lastestDate = null;

                const result: SectionModel = new SectionModel();
                result.title = 'สิ่งที่กำลังเกิดขึ้นรอบตัวคุณ';
                result.subtitle = 'สิ่งต่างๆเหล่านี้กำลังเกิดขึ้นบน' + PLATFORM_NAME_TH;
                result.type = 'SMALL';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];

                const hashtagNames = [];
                const hastagRowMap = {};
                for (const row of searchResult) {
                    const page = (row.page !== undefined && row.page.length > 0) ? row.page[0] : undefined;
                    const hashtag = (row.hashTagObj !== undefined && row.hashTagObj.length > 0) ? row.hashTagObj[0] : undefined;
                    const moreData: any = {};

                    if (lastestDate === null) {
                        lastestDate = row.createdDate;
                    }
                    const contentModel = new ContentModel();
                    contentModel.title = (hashtag) ? '#' + hashtag.name : '-';
                    contentModel.subtitle = row.name;
                    contentModel.iconUrl = row.iconURL;
                    // contentModel.commentCount = row.commentCount;
                    // contentModel.repostCount = row.repostCount;
                    // contentModel.shareCount = row.shareCount;
                    // contentModel.likeCount = row.likeCount;
                    // contentModel.viewCount = row.viewCount;

                    if (showUserAction) {
                        const userAction: any = await this.postsService.getUserPostAction(row._id + '', userId, true, true, true, true);
                        contentModel.isLike = userAction.isLike;
                        contentModel.isRepost = userAction.isRepost;
                        contentModel.isComment = userAction.isComment;
                        contentModel.isShare = userAction.isShare;
                    }

                    hastagRowMap[row.hashTag] = row;
                    hashtagNames.push(row.hashTag);

                    moreData.objectiveId = row._id;
                    contentModel.data = moreData;
                    contentModel.owner = {};
                    if (page !== undefined) {
                        contentModel.owner = this.parsePageField(page);
                    }

                    result.contents.push(contentModel);
                }
                result.dateTime = lastestDate;

                /*
                // saerch all post with objective hashtag
                if (hashtagNames.length > 0) {
                    console.log(hashtagNames);
                    const today = moment().toDate();
                    const postMatchStmt: any = {
                        isDraft: false,
                        deleted: false,
                        hidden: false,
                        startDateTime: { $lte: today },
                        objective: { $gt: {}} // search only objective not null
                    };
                    const postStmt = [
                        { $match: postMatchStmt },
                        { $sort: { createdDate: -1 } },
                        { $limit: limit },
                        { $addFields: { objectiveId: { $toObjectId: '$objective' }}},
                        {
                            $lookup: {
                                from: 'PageObjective',
                                localField: 'objectiveId',
                                foreignField: '_id',
                                as: 'objectives'
                            }
                        },
                    ];
                    const postAggregate = await this.postsService.aggregate(postStmt);
                    console.log(postAggregate);
                }*/

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