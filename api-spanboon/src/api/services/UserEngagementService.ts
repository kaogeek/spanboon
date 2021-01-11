/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { UserEngagement } from '../models/UserEngagement';
import { UserEngagementRepository } from '../repositories/UserEngagementRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { ObjectID } from 'mongodb';

@Service()
export class UserEngagementService {

    constructor(@OrmRepository() private userEngagementRepository: UserEngagementRepository) { }

    // find userEngagement
    public async find(findCondition: any): Promise<any[]> {
        return await this.userEngagementRepository.find(findCondition);
    }

    // find userEngagement
    public findOne(findCondition: any): Promise<any> {
        return this.userEngagementRepository.findOne(findCondition);
    }

    // create userEngagement
    public async create(userEngagement: UserEngagement): Promise<UserEngagement> {
        return await this.userEngagementRepository.save(userEngagement);
    }

    // update userEngagement
    public async update(query: any, newValue: any): Promise<any> {
        return await this.userEngagementRepository.updateOne(query, newValue);
    }

    // delete userEngagement
    public async delete(query: any, options?: any): Promise<any> {
        return await this.userEngagementRepository.deleteOne(query, options);
    }

    // find userEngagement
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.userEngagementRepository.aggregate(query, options).toArray();
    }

    // find UserEngagement Agg
    public aggregateEntity(query: any, options?: any): Promise<UserEngagement[]> {
        return this.userEngagementRepository.aggregateEntity(query, options).toArray();
    }

    // Search UserEngagement
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.userEngagementRepository.count(condition);
        } else {
            return this.userEngagementRepository.find(condition);
        }
    }

    public async getEngagement(contentId: ObjectID, userId: ObjectID, contentType: string, action: string, likeAsPage?: ObjectID): Promise<UserEngagement> {
        if (likeAsPage !== null && likeAsPage !== undefined) {
            return await this.findOne({ where: { contentId, userId, contentType, action, likeAsPage } });
        } else {
            return await this.findOne({ where: { contentId, userId, contentType, action } });
        }
    }
}
