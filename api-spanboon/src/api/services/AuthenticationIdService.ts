/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { Logger, LoggerInterface } from '../../decorators/Logger';
import { AuthenticationIdRepository } from '../repositories/AuthenticationIdRepository';
import { AuthenticationId } from '../models/AuthenticationId';
@Service()
export class AuthenticationIdService {

    constructor(
        @OrmRepository() private authenticationIdRepository: AuthenticationIdRepository,
        @Logger(__filename) private log: LoggerInterface) {
    }

    public findOne(accessToken: any): Promise<any> {
        return this.authenticationIdRepository.findOne(accessToken);
    }

    public async find(findCondition: any): Promise<AuthenticationId[]> {
        return await this.authenticationIdRepository.find(findCondition);
    }

    // update token
    public async update(query: any, newValue: any): Promise<any> {
        this.log.info('Update a token');

        return await this.authenticationIdRepository.updateOne(query, newValue);
    }

    // delete token
    public async delete(query: any, options?: any): Promise<any> {
        this.log.info('Delete a token');
        return await this.authenticationIdRepository.deleteOne(query, options);
    }

    // deleteMany

    public async deleteMany(query:any,options?:any):Promise<any>{
        return await this.authenticationIdRepository.deleteMany(query,options);
    }
    // create token
    public async create(accessToken: any): Promise<AuthenticationId> {
        return this.authenticationIdRepository.save(accessToken);
    }
}
