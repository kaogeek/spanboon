/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { UserSupportRepository } from '../repositories/UserSupportRepository';
@Service()
export class UserSupportService {

    constructor(
        @OrmRepository() private userSupportRepository: UserSupportRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    // create Device token and find the user who is login !!!!!
    public async create(data: any): Promise<any> {
        this.log.info('Create a user support.');
        return await this.userSupportRepository.save(data);
    }

    public async findOne(findCondition: any): Promise<any> {
        return await this.userSupportRepository.findOne(findCondition);
    }

    public async findPeople(findCondition?: any): Promise<any> {
        return await this.userSupportRepository.find(findCondition);
    }

    public async find(findCondition?: any): Promise<any> {
        return await this.userSupportRepository.find(findCondition);
    }

    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a user support.');
        return await this.userSupportRepository.deleteOne(query, options);
    }
    public async deleteMany(query: any, options?: any): Promise<any> {
        return await this.userSupportRepository.deleteMany(query, options);
    }
    public async updateToken(query: any, newValue: any): Promise<any> {
        this.log.info('Update a user support.');

        return await this.userSupportRepository.updateOne(query, newValue);
    }

    public async aggregate(query: any, options?: any): Promise<any[]> {
        return await this.userSupportRepository.aggregate(query, options).toArray();
    }
}
