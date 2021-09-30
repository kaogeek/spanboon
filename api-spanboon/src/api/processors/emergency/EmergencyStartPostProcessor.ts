/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { EmergencyEventService } from '../../services/EmergencyEventService';
import { PostsService } from '../../services/PostsService';

export class EmergencyStartPostProcessor extends AbstractTypeSectionProcessor {

    public static TYPE = 'EMERGENCY_START';

    constructor(private emergencyEventService: EmergencyEventService, private postsService: PostsService) {
        super();
        this.type = EmergencyStartPostProcessor.TYPE;
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let emergencyEventId = undefined;
                let userId = undefined;
                if (this.data !== undefined && this.data !== null) {
                    emergencyEventId = this.data.emergencyEventId;
                    userId = this.data.userId;
                }

                if (emergencyEventId === undefined || emergencyEventId === null || emergencyEventId === '') {
                    resolve(undefined);
                    return;
                }

                const emergencyEventAgg = [
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
                const emergencyEventList = await this.emergencyEventService.aggregate(emergencyEventAgg);
                if (emergencyEventList === undefined || emergencyEventList.length <= 0) {
                    resolve(undefined);
                }
                const emergencyEvent = emergencyEventList[0];

                // search first post of emergencyEvent and join gallery
                const postAgg = [
                    { $match: { emergencyEvent: emergencyEventId, deleted: false } },
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
                        title: emergencyEvent.title, // as a emergencyEvent name
                        subTitle: (emergencyEvent.hashTag !== undefined && emergencyEvent.hashTag.length > 0) ? '#' + emergencyEvent.hashTag[0].name : '', // as a emergencyEvent hashtag
                        detail: emergencyEvent.detail,
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