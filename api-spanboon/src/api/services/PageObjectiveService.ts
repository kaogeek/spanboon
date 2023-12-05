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
import { POST_TYPE } from '../../constants/PostType';
import { S3Service } from '../services/S3Service';
import { HashTagService } from './HashTagService';
import { HashTag } from '../models/HashTag';

@Service()
export class PageObjectiveService {

    constructor(@OrmRepository() private pageObjectiveRepository: PageObjectiveRepository,
        private fulfillmentCaseService: FulfillmentCaseService, private postsService: PostsService, private s3Service: S3Service, private hashTagService: HashTagService) { }

    // find PageObjective
    public find(findCondition?: any, options?: any): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.pageObjectiveRepository.find(findCondition);

                if (result && options && options.signURL) {
                    for (const objective of result) {
                        if (objective.s3IconURL && objective.s3IconURL !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(objective.s3IconURL);
                                Object.assign(objective, { iconSignURL: (signUrl ? signUrl : '') });
                            } catch (error) {
                                console.log('Search PageObjective Error: ', error);
                            }
                        }
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    // find PageObjective
    public findAggregate(findCondition?: any, options?: any): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.pageObjectiveRepository.find(findCondition);

                if (result && options && options.signURL) {
                    for (const objective of result) {
                        if (objective.s3IconURL && objective.s3IconURL !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(objective.s3IconURL);
                                Object.assign(objective, { iconSignURL: (signUrl ? signUrl : '') });
                            } catch (error) {
                                console.log('Search PageObjective Error: ', error);
                            }
                        }
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
    // find PageObjective
    public findOne(findCondition: any): Promise<any> {
        return this.pageObjectiveRepository.findOne(findCondition);
    }

    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.pageObjectiveRepository.aggregate(query, options).toArray();
    }

    public aggregateEntity(query: any, options?: any): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = await this.pageObjectiveRepository.aggregateEntity(query, options).toArray();

                if (result && options && options.signURL) {
                    for (const objective of result) {
                        if (objective.s3IconURL && objective.s3IconURL !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(objective.s3IconURL);
                                Object.assign(objective, { iconSignURL: (signUrl ? signUrl : '') });
                            } catch (error) {
                                console.log('Search PageObjective Error: ', error);
                            }
                        }
                    }
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }

    // create PageObjective
    public async create(objective: PageObjective): Promise<PageObjective> {

        const data: PageObjective = await this.pageObjectiveRepository.save(objective);

        if (!!data?.pageId) {
            const objectiveId = new Object(data.id);
            const pageId = new Object(data.pageId);
            const hashTagId = new Object(data.hashTag);

            const hashTag: HashTag = await this.hashTagService.findOne({ _id: hashTagId });

            const postsQuery = { postsHashTags: { $in: [hashTagId] }, pageId, $or: [{ objective: { $exists: false } }, { objective: null }] };
            const updateValue = { $set: { objective: objectiveId, objectiveTag: hashTag.name } };

            await this.postsService.updateMany(postsQuery, updateValue);
        }

        return data;
    }

    // update PageObjective
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageObjectiveRepository.updateOne(query, newValue);
    }

    // delete PageObjective
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageObjectiveRepository.deleteOne(query, options);
    }

    // delete PageObjectIve Many
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.pageObjectiveRepository.deleteMany(query, options);
    }

    // Search PageObjective
    public search(filter: SearchFilter, options?: any): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(
            filter.limit,
            filter.offset,
            filter.select,
            filter.relation,
            filter.whereConditions,
            filter.orderBy
        );

        if (filter.count) {
            return this.pageObjectiveRepository.count();
        } else {
            return this.find(condition, options);
        }
    }

    public searchAggregate(filter: SearchFilter, options?: any): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(
            filter.limit,
            filter.offset,
            filter.select,
            filter.relation,
            filter.whereConditions,
            filter.orderBy
        );

        if (filter.count) {
            return this.pageObjectiveRepository.count();
        } else {
            return this.findAggregate(condition, options);
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

                result = await this.postsService.sampleNeedsItems(matchStmt, simpleCount);

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}
