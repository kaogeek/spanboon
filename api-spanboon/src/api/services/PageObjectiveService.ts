/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PageObjective } from '../models/PageObjective';
import { PageObjectiveRepository } from '../repositories/PageObjectiveRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { ObjectID } from 'mongodb';
import { FulfillmentCaseService } from '../services/FulfillmentCaseService';
import { PostsService } from '../services/PostsService';
import { NeedsService } from '../services/NeedsService';
import { POST_TYPE } from '../../constants/PostType';

@Service()
export class PageObjectiveService {

    constructor(@OrmRepository() private pageObjectiveRepository: PageObjectiveRepository,
        private fulfillmentCaseService: FulfillmentCaseService, private postsService: PostsService, private needsService: NeedsService) { }

    // find PageObjective
    public find(findCondition?: any): Promise<any[]> {
        return this.pageObjectiveRepository.find(findCondition);
    }

    // find PageObjective
    public findOne(findCondition: any): Promise<any> {
        return this.pageObjectiveRepository.findOne(findCondition);
    }

    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.pageObjectiveRepository.aggregate(query, options).toArray();
    }

    // create PageObjective
    public async create(objective: PageObjective): Promise<PageObjective> {
        return await this.pageObjectiveRepository.save(objective);
    }

    // update PageObjective
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageObjectiveRepository.updateOne(query, newValue);
    }

    // delete PageObjective
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageObjectiveRepository.deleteOne(query, options);
    }

    // Search PageObjective
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.pageObjectiveRepository.count();
        } else {
            return this.pageObjectiveRepository.find(condition);
        }
    }

    public sampleFulfillmentUser(pageObjectiveId: ObjectID, simpleCount: number, fullfilStatus?: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = {
                    count: 0,
                    fulfillmentUser: [],
                    fulfillmentUserCount: 0
                };

                if (pageObjectiveId === undefined || pageObjectiveId === null) {
                    resolve(result);
                    return;
                }

                const matchStmt: any = {
                    postId: { $exists: true }
                };

                if (fullfilStatus !== undefined) {
                    matchStmt.status = fullfilStatus;
                }

                // count fullfilment case with page objective id
                const aggregateCountObjPost = [
                    { $match: matchStmt },
                    {
                        $lookup: {
                            from: 'Posts',
                            localField: 'postId',
                            foreignField: '_id',
                            as: 'posts'
                        }
                    },
                    {
                        $unwind: {
                            path: '$posts',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { $match: { 'posts.objective': pageObjectiveId, 'posts.deleted': false } },
                    { $group: { _id: null, count: { $sum: 1 } } },
                    { $project: { _id: 0 } }
                ];
                const countAggResult = await this.fulfillmentCaseService.aggregate(aggregateCountObjPost);

                if (countAggResult.length > 0) {
                    result.count = countAggResult[0].count;
                }

                // search fulfillment case sample user
                const aggregateObjPost = [
                    { $match: matchStmt },
                    {
                        $lookup: {
                            from: 'Posts',
                            localField: 'postId',
                            foreignField: '_id',
                            as: 'posts'
                        }
                    },
                    {
                        $unwind: {
                            path: '$posts',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { $match: { 'posts.objective': pageObjectiveId, 'posts.deleted': false } },
                    { $sample: { size: simpleCount } },
                    { $group: { _id: { requester: '$requester' }, count: { $sum: 1 } } },
                    {
                        $lookup: {
                            from: 'User',
                            localField: '_id.requester',
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
                        $project: {
                            'user.password': 0,
                            'user.coverPosition': 0,
                            'user.birthdate': 0,
                            'user.gender': 0,
                            'user.customGender': 0
                        }
                    }
                ];

                const aggResult = await this.fulfillmentCaseService.aggregate(aggregateObjPost);
                for (const row of aggResult) {
                    result.fulfillmentUser.push(row.user);
                }

                const aggregateCountAllUserPost = [
                    { $match: matchStmt },
                    {
                        $lookup: {
                            from: 'Posts',
                            localField: 'postId',
                            foreignField: '_id',
                            as: 'posts'
                        }
                    },
                    {
                        $unwind: {
                            path: '$posts',
                            preserveNullAndEmptyArrays: true
                        }
                    },
                    { $match: { 'posts.objective': pageObjectiveId, 'posts.deleted': false } },
                    { $group: { _id: { requester: '$requester' }, count: { $sum: 1 } } },
                    { $group: { _id: { requester: '$_id.requester' }, count: { $sum: 1 } } }
                ];

                const countAllUserResult = await this.fulfillmentCaseService.aggregate(aggregateCountAllUserPost);
                if (countAllUserResult.length > 0) {
                    result.fulfillmentUserCount = countAllUserResult[0].count;
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    public sampleRelatedHashTags(pageObjectiveId: ObjectID, simpleCount: number): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let result = [];

                if (pageObjectiveId === undefined || pageObjectiveId === null) {
                    resolve(result);
                    return;
                }

                const matchStmt: any = {
                    objective: pageObjectiveId,
                    postsHashTags: { $exists: true, $type: 'objectId' },
                    deleted: false
                };

                result = await this.postsService.sampleHashTags(matchStmt, simpleCount);

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    public sampleNeedsItems(pageObjectiveId: ObjectID, simpleCount: number): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let result = [];

                if (pageObjectiveId === undefined || pageObjectiveId === null) {
                    resolve(result);
                    return;
                }

                const matchStmt: any = {
                    objective: pageObjectiveId,
                    deleted: false,
                    type: POST_TYPE.NEEDS
                };

                result = await this.postsService.samplePostNeedsItems(matchStmt, simpleCount);

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}
