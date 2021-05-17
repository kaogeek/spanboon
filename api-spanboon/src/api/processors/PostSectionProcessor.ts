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
import moment from 'moment';

export class PostSectionProcessor extends AbstractSeparateSectionProcessor {

    private DEFAULT_SEARCH_LIMIT = 5;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private postsService: PostsService
    ) {
        super();
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                let limit: number = undefined;
                let offset: number = undefined;
                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.limit === 'number') {
                        limit = this.config.limit;
                    }

                    if (typeof this.config.offset === 'number') {
                        offset = this.config.offset;
                    }
                }

                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : limit;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;

                const searchFilter: SearchFilter = new SearchFilter();
                searchFilter.limit = limit;
                searchFilter.offset = offset;
                searchFilter.orderBy = {
                    createdDate: 'DESC'
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
                const today = moment().toDate();
                const postMatchStmt: any = {
                    isDraft: false,
                    deleted: false,
                    hidden: false,
                    startDateTime: { $lte: today },
                };
                const postStmt = [
                    { $match: postMatchStmt },
                    { $sort: { createdDate: -1 } },
                    { $skip: offset },
                    { $limit: 10 },
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
                            from: 'Page',
                            localField: 'pageId',
                            foreignField: '_id',
                            as: 'ownerUser'
                        }
                    },
                    {
                        $project: {
                            story: 0
                        }

                    }
                ];
                const postAggregate = await this.postsService.aggregate(postStmt);

                const lastestDate = null;
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'โพสต์ใหม่ ๆ ที่เกิดขึ้นในเดือนนี้' : this.config.title;
                result.subtitle = (this.config === undefined || this.config.subtitle === undefined) ? 'โพสต์ที่เกิดขึ้นในเดือนนี้ ภายในแพลตฟอร์ม' : this.config.subtitle;
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = this.getType(); // set type by processor type

                for (const row of postAggregate) {
                    const contents: any = {};
                    contents.owner = row.ownerUser;
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
}