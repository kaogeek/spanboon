/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { PageObjectiveService } from '../../services/PageObjectiveService';
import { PostsService } from '../../services/PostsService';
import { POST_TYPE } from '../../../constants/PostType';

export class ObjectiveNeedsProcessor extends AbstractTypeSectionProcessor {

    constructor(private pageObjectiveService: PageObjectiveService, private postsService: PostsService) {
        super();
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let objectiveId = undefined;
                let startDateTime = undefined;
                let endDateTime = undefined;
                let simpleCount = undefined;

                if (this.data !== undefined && this.data !== null) {
                    objectiveId = this.data.objectiveId;
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    simpleCount = this.data.simpleCount;
                }

                if (objectiveId === undefined || objectiveId === null || objectiveId === '') {
                    resolve(undefined);
                }

                const objectiveAgg = [
                    { $match: { _id: objectiveId } },
                    {
                        $lookup: {
                            from: 'HashTag',
                            localField: 'hashTag',
                            foreignField: '_id',
                            as: 'hashTag'
                        }
                    },
                ];
                const objectiveList = await this.pageObjectiveService.aggregate(objectiveAgg);
                if (objectiveList === undefined || objectiveList.length <= 0) {
                    resolve(undefined);
                }
                const objective = objectiveList[0];

                // search first post of objective and join gallery
                const postAggMatchStmt: any = {
                    objective: objectiveId,
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

                // if no simpleCount limit will set to 1.
                if (simpleCount !== undefined) {
                    postAgg.push({ $sample: { size: simpleCount } });
                } else {
                    postAgg.push({ $limit: 1 });
                }
                const searchResult = await this.postsService.aggregate(postAgg);

                let result = undefined;
                if (searchResult !== undefined && searchResult.length > 0) {
                    const post = searchResult[0];
                    result = {
                        title: objective.title, // as a objective name
                        subTitle: (objective.hashTag !== undefined && objective.hashTag.length > 0) ? '#' + objective.hashTag[0].name : '', // as a objective hashtag
                        detail: objective.detail,
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