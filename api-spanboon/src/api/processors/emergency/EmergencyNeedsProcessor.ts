/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { EmergencyEventService } from '../../services/EmergencyEventService';
import { PostsService } from '../../services/PostsService';
import { POST_TYPE } from '../../../constants/PostType';

export class EmergencyNeedsProcessor extends AbstractTypeSectionProcessor {

    public static TYPE = 'EMERGENCY_NEEDS';

    constructor(private emergencyEventService: EmergencyEventService, private postsService: PostsService) {
        super();
        this.type = EmergencyNeedsProcessor.TYPE;
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let emergencyEventId = undefined;
                let startDateTime = undefined;
                let endDateTime = undefined;
                let sampleCount = undefined;

                if (this.data !== undefined && this.data !== null) {
                    emergencyEventId = this.data.emergencyEventId;
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    sampleCount = this.data.sampleCount;
                }

                if (emergencyEventId === undefined || emergencyEventId === null || emergencyEventId === '') {
                    resolve(undefined);
                    return;
                }

                const emergencyAgg = [
                    { $match: { _id: emergencyEventId } },
                    {
                        $lookup: {
                            from: 'HashTag',
                            localField: 'hashTag',
                            foreignField: '_id',
                            as: 'hashTag'
                        }
                    },
                ];
                const emergencyList = await this.emergencyEventService.aggregate(emergencyAgg);
                if (emergencyList === undefined || emergencyList.length <= 0) {
                    resolve(undefined);
                }
                const emergency = emergencyList[0];

                // search first post of emergency and join gallery
                const postAggMatchStmt: any = {
                    emergency: emergencyEventId,
                    deleted: false,
                    type: POST_TYPE.NEEDS
                };
                
                const dateTimeAndArray = [];
                if (startDateTime !== undefined) {
                    dateTimeAndArray.push({ startDateTime: { $gte: startDateTime.toISOString() } });
                }
                if (endDateTime !== undefined) {
                    dateTimeAndArray.push({ startDateTime: { $lte: endDateTime.toISOString() } });
                }

                if (dateTimeAndArray.length > 0) {
                    postAggMatchStmt['$and'] = dateTimeAndArray;
                }

                const postAgg: any[] = [
                    { $match: postAggMatchStmt },
                    { $sort: { startDateTime: -1 } },
                    {
                        $lookup: {
                            from: 'Needs',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'needs'
                        }
                    }
                ];

                // if no sampleCount limit will set to 1.
                if (sampleCount !== undefined) {
                    postAgg.push({ $sample: { size: sampleCount } });
                } else {
                    postAgg.push({ $limit: 1 });
                }
                const searchResult = await this.postsService.aggregate(postAgg);

                let result = undefined;
                if (searchResult !== undefined && searchResult.length > 0) {
                    const post = searchResult[0];
                    result = {
                        title: emergency.title, // as a emergency name
                        subTitle: (emergency.hashTag !== undefined && emergency.hashTag.length > 0) ? '#' + emergency.hashTag[0].name : '', // as a emergency hashtag
                        detail: emergency.detail,
                        post,
                        type: this.type
                    };
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}