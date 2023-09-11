/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>
 */

import { AbstractTypeSectionProcessor } from '../AbstractTypeSectionProcessor';
import { PostsService } from '../../services/PostsService';
import moment from 'moment';
import { ObjectID } from 'mongodb';
// import { MONTHS } from '../../../constants/MonthsType';

export class EmergencyLastestProcessor extends AbstractTypeSectionProcessor {

    public static TYPE = 'EMERGENCY_LASTEST';

    constructor(
        private postsService: PostsService,
    ) {
        super();
        this.type = EmergencyLastestProcessor.TYPE;
    }

    public process(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                let emergencyEventId = undefined;
                let limit = undefined;
                let offset = undefined;
                let userId = undefined;
                let startDateTime = undefined;
                let endDateTime = undefined;
                const postAgg = [];
                let postObj = [];
                const postObjIds = [];
                let mode = undefined;
                let pages = undefined;
                if (this.data !== undefined && this.data !== null) {
                    emergencyEventId = this.data.emergencyEventId;
                    limit = this.data.limit;
                    offset = this.data.offset;
                    userId = this.data.userId;
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    mode = this.data.emergencyMode;
                    pages = this.data.emergencyPageList;
                    postObj = this.data.objIds;
                }

                if (emergencyEventId === undefined || emergencyEventId === null || emergencyEventId === '') {
                    resolve(undefined);
                    return;
                }

                if (limit === undefined || limit === null || limit === '') {
                    limit = 1;
                }

                if (offset === undefined || offset === null || offset === '') {
                    offset = 0;
                }
                if (postObj !== undefined && postObj.length > 0) {
                    for (const postId of postObj) {
                        postObjIds.push(new ObjectID(postId));
                    }
                }
                // search first post of emergencyEvent and join gallery
                const pageObjIds = [];
                if (pages !== undefined && pages.length > 0) {
                    const pageList = pages.split(',');
                    if (pageList.length > 0) {
                        for (let i = 0; i < pageList.length; i++) {
                            pageObjIds.push(new ObjectID(pageList[i]));
                        }
                    }
                }
                const postTotalCounts = await this.postsService.find({deleted: false, emergencyEvent: emergencyEventId });
                let query: any = { emergencyEvent: emergencyEventId, deleted: false, createdDate: { $lte: startDateTime, $gte: endDateTime } };
                if (pageObjIds.length > 0) {
                    query = {
                        _id: { $nin: postObjIds },
                        pageId: { $in: pageObjIds },
                        createdDate: { $lte: startDateTime, $gte: endDateTime },
                        emergencyEvent: emergencyEventId,
                        deleted: false,
                    };
                    postAgg.push({ $match: query });
                    postAgg.push({ $sample: { size: limit + offset } });
                }

                if (mode !== 'random') {
                    query = {
                        emergencyEvent: emergencyEventId,
                        deleted: false,
                        createdDate: { $lte: startDateTime, $gte: endDateTime }
                    };
                    postAgg.push({ $match: query });
                    postAgg.push({ $sort: { startDateTime: -1 } });
                }

                postAgg.push(
                    { $skip: offset },
                    { $limit: limit },
                    {
                        $lookup: {
                            from: 'SocialPost',
                            localField: '_id',
                            foreignField: 'postId',
                            as: 'socialPosts'
                        }
                    },
                    {
                        $project: {
                            'socialPosts': {
                                '_id': 0,
                                'pageId': 0,
                                'postId': 0,
                                'postBy': 0,
                                'postByType': 0
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: 'PostsGallery',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'postGallery'
                        }
                    });
                if (userId !== undefined && userId !== null && userId !== '') {
                    const userObjIds = new ObjectID(userId);
                    postAgg.push(
                        {
                            $lookup: {
                                from: 'UserLike',
                                let: { id: '$_id' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$$id', '$subjectId']
                                            }
                                        }
                                    },
                                    {
                                        $match: { userId: userObjIds }
                                    }
                                ],
                                as: 'userLike'
                            }
                        },
                    );
                }
                const searchResult = await this.postsService.aggregate(postAgg);
                let result = undefined;
                const content: any = [];
                if (mode !== 'random') {
                    if (searchResult !== undefined && searchResult.length > 0) {
                        // insert isLike Action
                        if (userId !== undefined && userId !== null && userId !== '') {
                            for (const post of searchResult) {
                                const results: any = {};
                                const parsedTimestamp = moment(post.createdDate);
                                const monthString = parsedTimestamp.format('MMMM'); // Output: "months"
                                results.month = String(monthString);
                                results.post = post;
                                content.push(results);
                            }
                        } else {
                            for (const post of searchResult) {
                                const results: any = {};
                                const parsedTimestamp = moment(post.createdDate);
                                const monthString = parsedTimestamp.format('MMMM'); // Output: "months"
                                results.month = String(monthString);
                                results.post = post;
                                content.push(results);
                            }
                        }
                    }
                } else {
                    for (const post of searchResult) {
                        content.push(post);
                    }
                }
                let groupedData: any = undefined;
                if (mode !== 'random') {
                    groupedData = content.reduce((accumulator, current) => {
                        const existingMonthEntry = accumulator.find(entry => entry.month === current.month);

                        if (existingMonthEntry) {
                            existingMonthEntry.post.push(current.post);
                        } else {
                            accumulator.push({ month: current.month, post: [current.post] });
                        }

                        return accumulator;
                    }, []);
                } else {
                    groupedData = [{ post: content }];
                }
                if (content.length > 0) {
                    result = {
                        title: 'โพสต์ต่างๆ ในช่วงนี้', // as a emergencyEvent name
                        subTitle: '',
                        detail: '',
                        posts: groupedData,
                        type: this.type,
                        totalPosts: postTotalCounts.length,
                    };
                }

                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
}