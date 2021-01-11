/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { FulfillmentAllocateStatement } from '../models/FulfillmentAllocateStatement';
import { FulfillmentAllocateStatementRepository } from '../repositories/FulfillmentAllocateStatementRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class FulfillmentAllocateStatementService {

    constructor(@OrmRepository() private fulfillmentAllocateStmtRepository: FulfillmentAllocateStatementRepository) { }

    // find FulfillmentAllocateStatement
    public find(findCondition?: any): Promise<FulfillmentAllocateStatement[]> {
        return this.fulfillmentAllocateStmtRepository.find(findCondition);
    }

    // find FulfillmentAllocateStatement
    public findOne(findCondition: any): Promise<FulfillmentAllocateStatement> {
        return this.fulfillmentAllocateStmtRepository.findOne(findCondition);
    }

    // aggregate FulfillmentAllocateStatement
    public aggregate(findCondition: any, options?: any): Promise<FulfillmentAllocateStatement[]> {
        return this.fulfillmentAllocateStmtRepository.aggregate(findCondition, options).toArray();
    }

    // create FulfillmentAllocateStatement
    public async create(objective: FulfillmentAllocateStatement): Promise<FulfillmentAllocateStatement> {
        return await this.fulfillmentAllocateStmtRepository.save(objective);
    }

    // update FulfillmentAllocateStatement
    public async update(query: any, newValue: any, options?: any): Promise<any> {
        return await this.fulfillmentAllocateStmtRepository.updateOne(query, newValue, options);
    }

    // update FulfillmentAllocateStatement
    public async updateMany(query: any, newValue: any, options?: any): Promise<any> {
        return await this.fulfillmentAllocateStmtRepository.updateMany(query, newValue, options);
    }

    // delete FulfillmentAllocateStatement
    public async delete(query: any, options?: any): Promise<any> {
        return await this.fulfillmentAllocateStmtRepository.deleteOne(query, options);
    }

    // delete FulfillmentAllocateStatement
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.fulfillmentAllocateStmtRepository.deleteMany(query, options);
    }

    // Search FulfillmentAllocateStatement
    public search(limit: number, offset: number, select: any = [], relation: any[], whereConditions: any = [], orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.fulfillmentAllocateStmtRepository.count();
        } else {
            return this.fulfillmentAllocateStmtRepository.find(condition);
        }
    }
}
