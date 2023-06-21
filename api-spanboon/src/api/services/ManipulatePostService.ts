/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { ManipulatePostRepository } from '../repositories/ManipulatePostRepository';
@Service()
export class ManipulatePostService {

    constructor(
        @OrmRepository() private manipulatePostRepository: ManipulatePostRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create is Read.');
        return await this.manipulatePostRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.manipulatePostRepository.findOne(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.manipulatePostRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a token');
        return await this.manipulatePostRepository.deleteOne(query, options);
    }

    public async updateToken(query: any, newValue: any): Promise<any> {
        this.log.info('Update a token');

        return await this.manipulatePostRepository.updateOne(query, newValue);
    }

    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.manipulatePostRepository.aggregate(query, options).toArray();
    }
    public async findOneAndUpdate(query: any, update: any, options?: any): Promise<any> {
        return await this.manipulatePostRepository.findOneAndUpdate(query, update, options);
    }
}
