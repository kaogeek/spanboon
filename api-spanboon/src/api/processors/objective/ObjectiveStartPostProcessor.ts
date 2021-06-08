/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { PageObjectiveService } from '../../services/PageObjectiveService';
import { PostsService } from '../../services/PostsService';

export class ObjectiveStartPostProcessor extends AbstractTypeSectionProcessor {

    public static TYPE = 'OBJECTIVE_START';

    constructor(private pageObjectiveService: PageObjectiveService, private postsService: PostsService) {
        super();
        this.type = ObjectiveStartPostProcessor.TYPE;
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let objectiveId = undefined;
                if (this.data !== undefined && this.data !== null) {
                    objectiveId = this.data.objectiveId;
                }

                if (objectiveId === undefined || objectiveId === null || objectiveId === '') {
                    resolve(undefined);
                    return;
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
                const postAgg = [
                    { $match: { objective: objectiveId, deleted: false } },
                    { $sort: { startDateTime: 1 } },
                    { $limit: 1 },
                    {
                        $lookup: {
                            from: 'PostsGallery',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'postGallery'
                        }
                    }
                ];
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