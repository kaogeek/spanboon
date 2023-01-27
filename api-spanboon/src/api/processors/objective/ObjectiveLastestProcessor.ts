/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { PostsService } from '../../services/PostsService';
import { S3Service } from '../../services/S3Service';

export class ObjectiveLastestProcessor extends AbstractTypeSectionProcessor {

    public static TYPE = 'OBJECTIVE_LASTEST';

    constructor(
        private postsService: PostsService,
        private s3Service: S3Service
    ) {
        super();
        this.type = ObjectiveLastestProcessor.TYPE;
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let objectiveId = undefined;
                let limit = undefined;
                let userId = undefined;
                if (this.data !== undefined && this.data !== null) {
                    objectiveId = this.data.objectiveId;
                    limit = this.data.limit;
                    userId = this.data.userId;
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
                    },
                    {
                        $project: {
                            'story': 0
                        }
                    }
                ];
                const searchResult = await this.postsService.aggregate(postAgg);

                let result = undefined;
                if (searchResult !== undefined && searchResult.length > 0) {
                    // insert isLike Action
                    if (userId !== undefined && userId !== null && userId !== '') {
                        for (const post of searchResult) {
                            const userAction: any = await this.postsService.getUserPostAction(post._id + '', userId, true, true, true, true);
                            const isLike = userAction.isLike;
                            const isRepost = userAction.isRepost;
                            const isComment = userAction.isComment;
                            const isShare = userAction.isShare;

                            post.isLike = isLike;
                            post.isRepost = isRepost;
                            post.isComment = isComment;
                            post.isShare = isShare;

                            if (!!post.s3CoverImage) {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(post.s3CoverImage);
                                Object.assign(post, { coverSignURL: (signUrl ? signUrl : '') });
                                delete post.s3CoverImage;
                            }

                            if (!!post.postGallery) {
                                for (const postGallery of post.postGallery) {
                                    const signUrl = await this.s3Service.getConfigedSignedUrl(postGallery.s3ImageURL);
                                    Object.assign(postGallery, { imageSignURL: (signUrl ? signUrl : '') });
                                    delete postGallery.s3ImageURL;
                                }
                            }
                        }
                    }

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