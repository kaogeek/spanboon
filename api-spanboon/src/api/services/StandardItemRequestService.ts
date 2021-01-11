/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { StandardItemRequest } from '../models/StandardItemRequest';
import { StandardItemRequestRepository } from '../repositories/StandardItemRequestRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class StandardItemRequestService {

    constructor(@OrmRepository() private standardItemRequestRepository: StandardItemRequestRepository) { }

    // find standardItemRequest
    public findOne(findCondition: any): Promise<any> {
        return this.standardItemRequestRepository.findOne(findCondition);
    }

    // create standardItemRequest
    public async create(standardItemRequest: StandardItemRequest): Promise<StandardItemRequest> {
        return await this.standardItemRequestRepository.save(standardItemRequest);
    }

    // update standardItemRequest
    public async update(query: any, newValue: any): Promise<any> {
        return await this.standardItemRequestRepository.updateOne(query, newValue);
    }

    // delete standardItemRequest
    public async delete(query: any, options?: any): Promise<any> {
        return await this.standardItemRequestRepository.deleteOne(query, options);
    }

    // find standardItemRequest
    public findAll(): Promise<any> {
        return this.standardItemRequestRepository.find();
    }

    // Search StandardItemRequest
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.standardItemRequestRepository.count(condition);
        } else {
            return this.standardItemRequestRepository.find(condition);
        }
    }
}
