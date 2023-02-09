/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { EmergencyEvent } from '../models/EmergencyEvent';
import { EmergencyEventRepository } from '../repositories/EmergencyEventRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { FulfillmentCaseService } from '../services/FulfillmentCaseService';
import { PostsService } from '../services/PostsService';
import { ObjectID } from 'mongodb';
import { POST_TYPE } from '../../constants/PostType';
import { HashTagService } from './HashTagService';
import { HashTag } from '../models/HashTag';

@Service()
export class EmergencyEventService {

    constructor(@OrmRepository() private emergencyEventRepository: EmergencyEventRepository
        , private fulfillmentCaseService: FulfillmentCaseService,
        private postsService: PostsService,
        private hashTagService: HashTagService) { }

    // find EmergencyEvent
    public find(findCondition?: any): Promise<EmergencyEvent[]> {
        return this.emergencyEventRepository.find(findCondition);
    }

    // find EmergencyEvent
    public findOne(findCondition: any): Promise<any> {
        return this.emergencyEventRepository.findOne(findCondition);
    }

    // find EmergencyEvent
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.emergencyEventRepository.aggregate(query, options).toArray();
    }

    // create EmergencyEvent
    public async create(emergencyEvent: EmergencyEvent): Promise<EmergencyEvent> {
        const data: EmergencyEvent = await this.emergencyEventRepository.save(emergencyEvent);

        if (!!data?.hashTag) {
            const emergencyEventId = new Object(data.id);
            const hashTagId = new Object(data.hashTag);

            const hashTag: HashTag = await this.hashTagService.findOne({ _id: hashTagId });

            const postsQuery = { postsHashTags: { $in: [hashTagId] }, $or: [{ emergencyEvent: { $exists: false } }, { emergencyEvent: null }] };
            const updateValue = { $set: { emergencyEvent: emergencyEventId, emergencyEventTag: hashTag.name } };

            await this.postsService.updateMany(postsQuery, updateValue);
        }

        return data;
    }

    // update EmergencyEvent
    public async update(query: any, newValue: any): Promise<any> {
        return await this.emergencyEventRepository.updateOne(query, newValue);
    }

    // delete EmergencyEvent
    public async delete(query: any, options?: any): Promise<any> {
        return await this.emergencyEventRepository.deleteOne(query, options);
    }

    // Search EmergencyEventOrdering
    public searchOrdering(filter: SearchFilter): Promise<any> {
        const orderiSort = { 'ordering': 1 };
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, orderiSort);
        if (filter.count) {
            return this.emergencyEventRepository.count(filter.whereConditions);
        } else {
            return this.emergencyEventRepository.find(condition);
        }
    }

    // Search EmergencyEvent
    public search(filter: SearchFilter): Promise<any> {
        const dateSort = { 'createdDate': -1 };
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, dateSort);
        if (filter.count) {
            return this.emergencyEventRepository.count(filter.whereConditions);
        } else {
            return this.emergencyEventRepository.find(condition);
        }
    }

    public sampleFulfillmentUser(emergencyEventId: ObjectID, simpleCount: number, fullfilStatus?: string): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                const result = {
                    count: 0,
                    fulfillmentUser: [],
                    fulfillmentUserCount: 0
                };

                if (emergencyEventId === undefined || emergencyEventId === null) {
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
                    { $match: { 'posts.emergencyEvent': emergencyEventId, 'posts.deleted': false } },
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
                    { $match: { 'posts.emergencyEvent': emergencyEventId, 'posts.deleted': false } },
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
                    { $match: { 'posts.emergencyEvent': emergencyEventId, 'posts.deleted': false } },
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

    public sampleRelatedHashTags(emergencyEventId: ObjectID, simpleCount: number): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let result = [];

                if (emergencyEventId === undefined || emergencyEventId === null) {
                    resolve(result);
                    return;
                }

                const matchStmt: any = {
                    emergencyEvent: emergencyEventId,
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

    public sampleNeedsItems(emergencyEventId: ObjectID, simpleCount: number): Promise<any[]> {
        return new Promise(async (resolve, reject) => {
            try {
                let result = [];

                if (emergencyEventId === undefined || emergencyEventId === null) {
                    resolve(result);
                    return;
                }

                const matchStmt: any = {
                    emergencyEvent: emergencyEventId,
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
