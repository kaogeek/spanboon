/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { PageObjectiveService } from '../../services/PageObjectiveService';
import { PostsService } from '../../services/PostsService';
import { S3Service } from '../../services/S3Service';

export class ObjectiveStartPostProcessor extends AbstractTypeSectionProcessor {

    public static TYPE = 'OBJECTIVE_START';

    constructor(private pageObjectiveService: PageObjectiveService, private postsService: PostsService, private s3Service: S3Service) {
        super();
        this.type = ObjectiveStartPostProcessor.TYPE;
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let objectiveId = undefined;
                let userId = undefined;
                if (this.data !== undefined && this.data !== null) {
                    objectiveId = this.data.objectiveId;
                    userId = this.data.userId;
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

                    let isLike = false;
                    let isRepost = false;
                    let isComment = false;
                    let isShare = false;
                    if (userId !== undefined && userId !== null && userId !== '') {
                        const userAction: any = await this.postsService.getUserPostAction(post._id + '', userId, true, true, true, true);
                        isLike = userAction.isLike;
                        isRepost = userAction.isRepost;
                        isComment = userAction.isComment;
                        isShare = userAction.isShare;
                    }

                    result = {
                        title: objective.title, // as a objective name
                        subTitle: (objective.hashTag !== undefined && objective.hashTag.length > 0) ? '#' + objective.hashTag[0].name : '', // as a objective hashtag
                        detail: objective.detail,
                        post,
                        type: this.type,
                        isLike,
                        isRepost,
                        isComment,
                        isShare
                    };
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}