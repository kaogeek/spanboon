/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { ContentBlock } from '../models/ContentBlock';
import { ContentBlockRepository } from '../repositories/ContentBlockRepository';
import { SearchUtil } from '../../utils/SearchUtil';

@Service()
export class ContentBlockService {

    constructor(@OrmRepository() private contentBlockRepository: ContentBlockRepository) { }

    // find ContentBlock
    public async find(findCondition: any): Promise<ContentBlock[]> {
        return this.contentBlockRepository.find(findCondition);
    }

    // find ContentBlock
    public findOne(findCondition: any): Promise<ContentBlock> {
        return this.contentBlockRepository.findOne(findCondition);
    }

    // create ContentBlock
    public async create(ContentBlock: ContentBlock): Promise<ContentBlock> {
        return await this.contentBlockRepository.save(ContentBlock);
    }

    // update ContentBlock
    public async update(query: any, newValue: any): Promise<any> {
        return await this.contentBlockRepository.updateOne(query, newValue);
    }

    // delete ContentBlock
    public async delete(query: any, options?: any): Promise<any> {
        return await this.contentBlockRepository.deleteOne(query, options);
    }

    // aggregate ContentBlock
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.contentBlockRepository.aggregate(query, options).toArray();
    }

    // Search ContentBlock
    public search(limit: number, offset: number, select: any[], relation: any, whereConditions: any, orderBy: any, count: boolean): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(limit, offset, select, relation, whereConditions, orderBy);

        if (count) {
            return this.contentBlockRepository.count(whereConditions);
        } else {
            return this.contentBlockRepository.find(condition);
        }
    }
}
