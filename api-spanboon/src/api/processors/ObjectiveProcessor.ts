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
import { PostsService } from '../services/PostsService';
import { PLATFORM_NAME_TH } from '../../constants/SystemConfig';
import moment from 'moment';

export class ObjectiveProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 5;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private pageObjectiveService: PageObjectiveService,
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
                let searchOfficialOnly: number = undefined;

                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : limit;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;

                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.searchOfficialOnly === 'boolean') {
                        searchOfficialOnly = this.config.searchOfficialOnly;
                    }
                }

                const matchStmt: any = {
                };

                const result: SectionModel = new SectionModel();
                result.title = 'สิ่งที่กำลังเกิดขึ้นรอบตัวคุณ';
                result.subtitle = 'สิ่งต่างๆเหล่านี้กำลังเกิดขึ้นบน' + PLATFORM_NAME_TH;
                result.type = 'OBJECTIVE';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];

                const pageObjectiveResult: any[] = [];
                for (let index = 0; pageObjectiveResult.length < 5; index++) {

                    const pageObjStmt = [
                        { $match: matchStmt },
                        { $sort: { createdDate: -1 } },
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
                    const searchResult = await this.pageObjectiveService.aggregate(pageObjStmt);
                    if (searchResult.length === 0) {
                        resolve(result);
                        break;
                    }

                    for (const iterator of searchResult) {
                        if (iterator.hashTagObj.length > 0) {
                            pageObjectiveResult.push(iterator);
                        }
                    }
                    offset = (offset + searchResult.length);

                }

                let lastestDate = null;

                const hashtagNames = [];
                const hastagRowMap = {};
                for (const row of pageObjectiveResult) {
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
                                    { $sort: { createdDate: -1 } },
                                    { $limit: limit },
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

                                // overide search Official
                                if (searchOfficialOnly) {
                                    postStmt.splice(1, 0, {
                                        $lookup: {
                                            from: 'Page',
                                            localField: 'pageId',
                                            foreignField: '_id',
                                            as: 'page'
                                        }
                                    });
                                    postStmt.splice(2, 0, { $match: { 'page.isOfficial': true } });
                                }
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