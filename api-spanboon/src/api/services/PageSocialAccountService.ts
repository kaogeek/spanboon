/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { PageSocialAccount } from '../models/PageSocialAccount';
import { PageSocialAccountRepository } from '../repositories/PageSocialAccountRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class PageSocialAccountService {

    constructor(@OrmRepository() private pageSocialAccountRepository: PageSocialAccountRepository) { }

    // find PageSocialAccount
    public find(findCondition: any): Promise<PageSocialAccount[]> {
        return this.pageSocialAccountRepository.find(findCondition);
    }

    // find PageSocialAccount
    public findOne(findCondition: any): Promise<PageSocialAccount> {
        return this.pageSocialAccountRepository.findOne(findCondition);
    }

    // find PageSocialAccount
    public aggregate(query: any, options?: any): Promise<PageSocialAccount[]> {
        return this.pageSocialAccountRepository.aggregate(query, options).toArray();
    }

    // create PageSocialAccount
    public async create(pageAbout: PageSocialAccount): Promise<PageSocialAccount> {
        return await this.pageSocialAccountRepository.save(pageAbout);
    }

    // update PageSocialAccount
    public async update(query: any, newValue: any): Promise<any> {
        return await this.pageSocialAccountRepository.updateOne(query, newValue);
    }

    // delete PageSocialAccount
    public async delete(query: any, options?: any): Promise<any> {
        return await this.pageSocialAccountRepository.deleteOne(query, options);
    }

    // Search PageSocialAccount
    public search(filter: SearchFilter): Promise<any> { 
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.pageSocialAccountRepository.count(filter.whereConditions);
        } else {
            return this.pageSocialAccountRepository.find(condition);
        }
    }
}
