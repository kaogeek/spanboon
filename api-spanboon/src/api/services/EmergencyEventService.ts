/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { EmergencyEvent } from '../models/EmergencyEvent';
import { EmergencyEventRepository } from '../repositories/EmergencyEventRepository';
import { SearchUtil } from '../../utils/SearchUtil';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

@Service()
export class EmergencyEventService {

    constructor(@OrmRepository() private emergencyEventRepository: EmergencyEventRepository) { }

    // find EmergencyEvent
    public find(findCondition?: any): Promise<EmergencyEvent[]> {
        return this.emergencyEventRepository.find(findCondition);
    }

    // find EmergencyEvent
    public findOne(findCondition: any): Promise<any> {
        return this.emergencyEventRepository.findOne(findCondition);
    }

    // find EmergencyEvent
    public aggregate(query: any, options?: any): Promise<any[]> {
        return this.emergencyEventRepository.aggregate(query, options).toArray();
    }

    // create EmergencyEvent
    public async create(emergencyEvent: EmergencyEvent): Promise<EmergencyEvent> {
        return await this.emergencyEventRepository.save(emergencyEvent);
    }

    // update EmergencyEvent
    public async update(query: any, newValue: any): Promise<any> {
        return await this.emergencyEventRepository.updateOne(query, newValue);
    }

    // delete EmergencyEvent
    public async delete(query: any, options?: any): Promise<any> {
        return await this.emergencyEventRepository.deleteOne(query, options);
    }

    // Search EmergencyEvent
    public search(filter: SearchFilter): Promise<any> {
        const condition: any = SearchUtil.createFindCondition(filter.limit, filter.offset, filter.select, filter.relation, filter.whereConditions, filter.orderBy);

        if (filter.count) {
            return this.emergencyEventRepository.count(filter.whereConditions);
        } else {
            return this.emergencyEventRepository.find(condition);
        }
    }
}
