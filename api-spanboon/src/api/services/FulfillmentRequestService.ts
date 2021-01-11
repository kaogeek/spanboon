/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { FulfillmentRequest } from '../models/FulfillmentRequest';
import { FulfillmentRequestRepository } from '../repositories/FulfillmentRequestRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { ObjectID } from 'mongodb';

@Service()
export class FulfillmentRequestService {

    constructor(@OrmRepository() private fulfillmentRequestRepository: FulfillmentRequestRepository) { }

    // find FulfillmentRequest
    public find(findCondition?: any): Promise<FulfillmentRequest[]> {
        return this.fulfillmentRequestRepository.find(findCondition);
    }

    // find FulfillmentRequest
    public findOne(findCondition: any): Promise<FulfillmentRequest> {
        return this.fulfillmentRequestRepository.findOne(findCondition);
    }

    // aggregate FulfillmentRequest
    public aggregate(findCondition: any, options?: any): Promise<FulfillmentRequest[]> {
        return this.fulfillmentRequestRepository.aggregate(findCondition, options).toArray();
    }

    // create FulfillmentRequest
    public async create(objective: FulfillmentRequest): Promise<FulfillmentRequest> {
        return await this.fulfillmentRequestRepository.save(objective);
    }

    // update FulfillmentRequest
    public async update(query: any, newValue: any, options?: any): Promise<any> {
        return await this.fulfillmentRequestRepository.updateOne(query, newValue, options);
    }

    // update FulfillmentRequest
    public async updateMany(query: any, newValue: any, options?: any): Promise<any> {
        return await this.fulfillmentRequestRepository.updateMany(query, newValue, options);
    }

    // delete FulfillmentRequest
    public async delete(query: any, options?: any): Promise<any> {
        return await this.fulfillmentRequestRepository.deleteOne(query, options);
    }

    // delete FulfillmentRequest
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.fulfillmentRequestRepository.deleteMany(query, options);
    }

    // Search FulfillmentRequest
    public search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.fulfillmentRequestRepository.count();
        } else {
            return this.fulfillmentRequestRepository.find(condition);
        }
    }

    public async findFulfillmentCaseRequests(fulfillmentCaseId: string): Promise<FulfillmentRequest[]> {
        const findStmt: any = {
            fulfillmentCase: new ObjectID(fulfillmentCaseId),
            deleted: false
        };

        return this.fulfillmentRequestRepository.find(findStmt);
    }
}
