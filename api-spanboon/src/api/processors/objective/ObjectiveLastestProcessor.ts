/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { PostsService } from '../../services/PostsService';

export class ObjectiveLastestProcessor extends AbstractTypeSectionProcessor {

    constructor(private postsService: PostsService) {
        super();
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let objectiveId = undefined;
                let limit = undefined;
                if (this.data !== undefined && this.data !== null) {
                    objectiveId = this.data.objectiveId;
                    limit = this.data.limit;
                }

                if (objectiveId === undefined || objectiveId === null || objectiveId === '') {
                    resolve(undefined);
                    return;
                }

                if (limit === undefined || limit === null || limit === '') {
                    limit = 1;
                }

                // search first post of objective and join gallery
                const postAgg = [
                    { $match: { objective: objectiveId, deleted: false } },
                    { $sort: { startDateTime: -1 } },
                    { $limit: limit },
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
                    result = {
                        title: 'โพสต์ต่างๆ ในช่วงนี้', // as a objective name
                        subTitle: '',
                        detail: '',
                        posts: searchResult,
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