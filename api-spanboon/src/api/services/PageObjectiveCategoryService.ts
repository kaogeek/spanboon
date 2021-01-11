/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PageObjectiveCategory } from '../models/PageObjectiveCategory';
import { PageObjectiveCategoryRepository } from '../repositories/PageObjectiveCategoryRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class PageObjectiveCategoryService {

    constructor(@OrmRepository() private pageObjectiveCategoryRepository: PageObjectiveCategoryRepository) { }

    // find objectiveCategory
    public async find(findCondition: any): Promise<any> {
        return await this.pageObjectiveCategoryRepository.find(findCondition);
    }

    // find objectiveCategory
    public findOne(findCondition: any): Promise<any> {
        return this.pageObjectiveCategoryRepository.findOne(findCondition);
    }

    // create objectiveCategory
    public async create(objectiveCategory: PageObjectiveCategory): Promise<PageObjectiveCategory> {
        return await this.pageObjectiveCategoryRepository.save(objectiveCategory);
    }

    // update objectiveCategory
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageObjectiveCategoryRepository.updateOne(query, newValue);
    }

    // delete objectiveCategory
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageObjectiveCategoryRepository.deleteOne(query, options);
    }

    // find objectiveCategory
    public findAll(): Promise<any> {
        return this.pageObjectiveCategoryRepository.find();
    }

    // Search PageObjectiveCategory
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.pageObjectiveCategoryRepository.count(condition);
        } else {
            return this.pageObjectiveCategoryRepository.find(condition);
        }
    }
}
