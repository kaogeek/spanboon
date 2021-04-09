/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { SectionModel } from '../models/SectionModel';
import { ContentModel } from '../models/ContentModel';
import { AbstractSectionModelProcessor } from './AbstractSectionModelProcessor';
import { ObjectiveProcessorData } from './data/ObjectiveProcessorData';
import { PageObjectiveService } from '../services/PageObjectiveService';
import { UserFollowService } from '../services/UserFollowService';
import { PostsService } from '../services/PostsService';
import { ObjectID } from 'mongodb';
import moment from 'moment';

export class ObjectiveProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 5;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private pageObjectiveService: PageObjectiveService,
        private userFollowService: UserFollowService,
        private postsService: PostsService,
    ) {
        super();
    }

    public setData(data: ObjectiveProcessorData): void {
        this.data = data;
    }

    // new post which user follow
    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                let limit: number = undefined;
                let offset: number = undefined;
                // let showUserAction = false;
                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.limit === 'number') {
                        limit = this.config.limit;
                    }

                    if (typeof this.config.offset === 'number') {
                        offset = this.config.offset;
                    }

                    // if (typeof this.config.showUserAction === 'boolean') {
                    //     showUserAction = this.config.showUserAction;
                    // }
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
                if (userId !== undefined) {
                    const followStmt = [
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
                    { $skip: offset },
                    { $limit: limit },
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
                            from: 'HashTag',
                            localField: 'hashTag',
                            foreignField: '_id',
                            as: 'hashTagObj'
                        }
                    }
                ];
                const searchResult = await this.pageObjectiveService.aggregate(pageObjStmt);

                let lastestDate = null;

                const result: SectionModel = new SectionModel();
                result.title = 'สิ่งนี้กำลังเกิดขึ้นรอบตัวคุณ';
                result.subtitle = 'การเติมเต็ม ที่เกิดขึ้นบนแพลตฟอร์มสะพานบุญ';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];

                const hashtagNames = [];
                const hastagRowMap = {};
                for (const row of searchResult) {
                    if (row) {
                        const page = (row.page !== undefined && row.page.length > 0) ? row.page[0] : undefined;
                        const hashtag = (row.hashTagObj !== undefined && row.hashTagObj.length > 0) ? row.hashTagObj[0] : undefined;

                        if (lastestDate === null) {
                            lastestDate = row.createdDate;
                        }
                        const contentModel = new ContentModel();
                        contentModel.title = (hashtag) ? '#' + row.hashTagObj[0].name : '-';
                        contentModel.subtitle = row.name;
                        contentModel.iconUrl = row.iconURL;

                        hastagRowMap[row.hashTag] = row;
                        hashtagNames.push(row.hashTag);

                        contentModel.owner = {};
                        if (page !== undefined) {
                            contentModel.owner = this.parsePageField(page);
                        }

                        if (row.hashTagObj.length > 0) {

                            // saerch all post with objective hashtag
                            if (hashtagNames.length > 0) {
                                const today = moment().toDate();
                                const postMatchStmt: any = {
                                    isDraft: false,
                                    deleted: false,
                                    hidden: false,
                                    startDateTime: { $lte: today },
                                    // objectiveTag: new ObjectID(row.hashTagObj[0].name)
                                    objectiveTag: row.hashTagObj[0].name
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
                                    },
                                    {
                                        $project: {
                                            story: 0
                                        }

                                    }
                                ];
                                const postAggregate = await this.postsService.aggregate(postStmt);
                                contentModel.post = postAggregate;
                            }

                        }

                        result.contents.push(contentModel);
                    }
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