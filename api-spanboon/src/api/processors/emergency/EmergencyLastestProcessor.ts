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
import { PageService } from 'src/api/services/PageService';

// import { MONTHS } from '../../../constants/MonthsType';

export class EmergencyLastestProcessor extends AbstractTypeSectionProcessor {

    public static TYPE = 'EMERGENCY_LASTEST';

    constructor(
        private postsService: PostsService,
        private pageService: PageService
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
                let postAgg = undefined;
                let emergencyEventMode = undefined;
                let pages = undefined;
                if (this.data !== undefined && this.data !== null) {
                    emergencyEventId = this.data.emergencyEventId;
                    limit = this.data.limit;
                    offset = this.data.offset;
                    userId = this.data.userId;
                    startDateTime = this.data.startDateTime;
                    endDateTime = this.data.endDateTime;
                    emergencyEventMode = this.data.emergencyMode;
                    pages = this.data.emergencyPageList;
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
                const pageStacks: any = [];
                const pageObjIds: any = [];
                let pageMaked: any = undefined;
                if (pages.length > 0) {
                    const splitComma = pages.split(',');
                    for (const page of splitComma) {
                        pageStacks.push(String(page));
                    }
                }
                if (pageStacks.length > 0) {
                    pageMaked = await this.pageService.aggregate({ email: { $in: { pageStacks } } });
                }
                if (pageMaked.length > 0) {
                    for (const pageId of pageMaked) {
                        pageObjIds.push(new ObjectID(pageId._id));
                    }
                }
                // search first post of emergencyEvent and join gallery
                let sortEmer: any = undefined;
                let matchPost: any = undefined;
                matchPost = { emergencyEvent: emergencyEventId, deleted: false, createdDate: { $lte: startDateTime, $gte: endDateTime } };
                if (pages.length > 0) {
                    matchPost = { pageId: { $in: { pageObjIds } } };
                }
                if (emergencyEventMode === 'random') {
                    sortEmer = { $sample: { size: 10 } };
                } else {
                    sortEmer = { $sort: { startDateTime: -1 } };
                }
                postAgg = [
                    { $match: matchPost },
                    { $limit: limit },
                    { $skip: offset },
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
                    }
                ];
                console.log('matchPost', matchPost);
                postAgg.push(sortEmer);
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
                if (String(emergencyEventMode) !== 'random') {
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
                    if (userId !== undefined && userId !== null && userId !== '') {
                        for (const post of searchResult) {
                            content.push(post);
                        }
                    } else {
                        for (const post of searchResult) {
                            content.push(post);
                        }
                    }
                }
                let groupedData = undefined;
                if (emergencyEventMode === 'random') {
                    groupedData = content.reduce((accumulator, current) => {
                        const existingMonthEntry = accumulator.find(entry => entry.month === current.month);

                        if (existingMonthEntry) {
                            existingMonthEntry.post.push(current.post);
                        } else {
                            accumulator.push({ month: current.month, post: [current.post] });
                        }

                        return accumulator;
                    }, []);
                }

                if (content.length > 0) {
                    result = {
                        title: 'โพสต์ต่างๆ ในช่วงนี้', // as a emergencyEvent name
                        subTitle: '',
                        detail: '',
                        posts: groupedData,
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