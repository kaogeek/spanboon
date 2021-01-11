/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { FulfillmentCase } from '../models/FulfillmentCase';
import { FulfillmentCaseRepository } from '../repositories/FulfillmentCaseRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class FulfillmentCaseService {

    constructor(@OrmRepository() private fulfillmentCaseRepository: FulfillmentCaseRepository) { }

    // find FulfillmentCase
    public find(findCondition: any): Promise<FulfillmentCase[]> {
        return this.fulfillmentCaseRepository.find(findCondition);
    }

    // find FulfillmentCase
    public findOne(findCondition: any): Promise<FulfillmentCase> {
        return this.fulfillmentCaseRepository.findOne(findCondition);
    }

    // aggregate FulfillmentCase
    public aggregate(findCondition: any, options?: any): Promise<any[]> {
        return this.fulfillmentCaseRepository.aggregate(findCondition, options).toArray();
    }

    // create FulfillmentCase
    public async create(objective: FulfillmentCase): Promise<FulfillmentCase> {
        return await this.fulfillmentCaseRepository.save(objective);
    }

    // update FulfillmentCase
    public async update(query: any, newValue: any): Promise<any> {
        return await this.fulfillmentCaseRepository.updateOne(query, newValue);
    }

    // delete FulfillmentCase
    public async delete(query: any, options?: any): Promise<any> {
        return await this.fulfillmentCaseRepository.deleteOne(query, options);
    }

    // delete FulfillmentCase
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.fulfillmentCaseRepository.deleteMany(query, options);
    }

    // Search FulfillmentCase
    public search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.fulfillmentCaseRepository.count();
        } else {
            return this.fulfillmentCaseRepository.find(condition);
        }
    }
}
