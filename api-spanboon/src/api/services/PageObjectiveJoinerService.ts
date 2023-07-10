/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PageObjectiveJoiner } from '../models/PageObjectiveJoiner';
import { PageObjectiveJoinerRepository } from '../repositories/PageObjectiveJoinerRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class PageObjectiveJoinerService {

    constructor(@OrmRepository() private pageObjectiveJoinerRepository: PageObjectiveJoinerRepository) { }

    // find objectiveCategory
    public async find(findCondition: any): Promise<any> {
        return await this.pageObjectiveJoinerRepository.find(findCondition);
    }

    // find page
    public aggregate(query: any, options?: any): Promise<any> {
        return this.pageObjectiveJoinerRepository.aggregate(query, options).toArray();
    }
    // find objectiveCategory
    public findOne(findCondition: any): Promise<any> {
        return this.pageObjectiveJoinerRepository.findOne(findCondition);
    }

    // create objectiveCategory
    public async create(pageObjectiveJoiner: PageObjectiveJoiner): Promise<PageObjectiveJoiner> {
        return await this.pageObjectiveJoinerRepository.save(pageObjectiveJoiner);
    }

    // update objectiveCategory
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageObjectiveJoinerRepository.updateOne(query, newValue);
    }

    // delete objectiveCategory
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageObjectiveJoinerRepository.deleteOne(query, options);
    }

    // find objectiveCategory
    public findAll(): Promise<any> {
        return this.pageObjectiveJoinerRepository.find();
    }

    // Search PageObjectiveCategory
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.pageObjectiveJoinerRepository.count(condition);
        } else {
            return this.pageObjectiveJoinerRepository.find(condition);
        }
    }
}
