/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Fulfillment } from '../models/Fulfillment';
import { FulfillmentRepository } from '../repositories/FulfillmentRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class FulfillmentService {

    constructor(@OrmRepository() private fulfillmentRepository: FulfillmentRepository) { }

    // find Fulfillment
    public find(findCondition: any): Promise<any> {
        return this.fulfillmentRepository.find(findCondition);
    }

    // find Fulfillment
    public findOne(findCondition: any): Promise<any> {
        return this.fulfillmentRepository.findOne(findCondition);
    }

    // create Fulfillment
    public async create(objective: Fulfillment): Promise<Fulfillment> {
        return await this.fulfillmentRepository.save(objective);
    }

    // update Fulfillment
    public async update(query: any, newValue: any): Promise<any> {
        return await this.fulfillmentRepository.updateOne(query, newValue);
    }

    // delete Fulfillment
    public async delete(query: any, options?: any): Promise<any> {
        return await this.fulfillmentRepository.deleteOne(query, options);
    }

    // delete Fulfillment
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.fulfillmentRepository.deleteMany(query, options);
    }

    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.fulfillmentRepository.aggregate(query, options).toArray();
    }

    // Search Fulfillment
    public search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.fulfillmentRepository.count();
        } else {
            return this.fulfillmentRepository.find(condition);
        }
    }
}
