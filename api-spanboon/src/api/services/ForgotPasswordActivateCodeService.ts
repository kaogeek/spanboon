/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { ForgotPasswordActivateCode } from '../models/ForgotPasswordActivateCode';
import { ForgotPasswordActivateCodeRepository } from '../repositories/ForgotPasswordActivateCodeRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class ForgotPasswordActivateCodeService {

    constructor(@OrmRepository() private forgotPasswordActivateCodeRepository: ForgotPasswordActivateCodeRepository) { }

    // find forgotPasswordActivateCode
    public find(findCondition: any): Promise<ForgotPasswordActivateCode[]> {
        return this.forgotPasswordActivateCodeRepository.find(findCondition);
    }

    // find forgotPasswordActivateCode
    public findOne(findCondition: any): Promise<ForgotPasswordActivateCode> {
        return this.forgotPasswordActivateCodeRepository.findOne(findCondition);
    }

    // create forgotPasswordActivateCode
    public async create(forgotPasswordActivateCode: ForgotPasswordActivateCode): Promise<ForgotPasswordActivateCode> {
        return await this.forgotPasswordActivateCodeRepository.save(forgotPasswordActivateCode);
    }

    // update forgotPasswordActivateCode
    public update(query: any, newValue: any): Promise<any> {
        return this.forgotPasswordActivateCodeRepository.updateOne(query, newValue);
    }

    // delete forgotPasswordActivateCode
    public async delete(query: any, options?: any): Promise<any> {
        return await this.forgotPasswordActivateCodeRepository.deleteOne(query, options);
    }

    // delete forgotPasswordActivateCode
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.forgotPasswordActivateCodeRepository.deleteMany(query, options);
    }

    // aggregate forgotPasswordActivateCode
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.forgotPasswordActivateCodeRepository.aggregate(query, options).toArray();
    }

    // aggregate forgotPasswordActivateCode
    public aggregateEntity(query: any, options?: any): Promise<ForgotPasswordActivateCode[]> {
        return this.forgotPasswordActivateCodeRepository.aggregateEntity(query, options).toArray();
    }

    // Search ForgotPasswordActivateCode
    public search(search: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(search.limit, search.offset, search.select, search.relation, search.whereConditions, search.orderBy);

        if (search.count) {
            return this.forgotPasswordActivateCodeRepository.count(search.whereConditions);
        } else {
            return this.forgotPasswordActivateCodeRepository.find(condition);
        }
    }
}
