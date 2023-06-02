/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { AbstractSeparateSectionProcessor } from './AbstractSeparateSectionProcessor';
import { SectionModel } from '../models/SectionModel';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { S3Service } from '../services/S3Service';
import { UserService } from '../services/UserService';
import { UserFollowService } from '../services/UserFollowService';
import { PageObjectiveService } from '../services/PageObjectiveService';
import { UserLikeService } from '../services/UserLikeService';
import { UserLike } from '../models/UserLike';
import { ObjectID } from 'mongodb';
import { PageService } from '../services/PageService';
import { EmergencyEventService } from '../services/EmergencyEventService';
import { LIKE_TYPE } from '../../constants/LikeType';
// import { EmergencyEventService } from '../services/EmergencyEventService';
export class FollowingContentsModelProcessor extends AbstractSeparateSectionProcessor {
    private DEFAULT_SEARCH_LIMIT = 10;
    private DEFAULT_SEARCH_OFFSET = 0;
    constructor(
        // private postsService: PostsService,
        private s3Service: S3Service,
        private userLikeService: UserLikeService,
        private emergencyEventService: EmergencyEventService,
        private pageObjectiveService: PageObjectiveService,
        private userFollowService: UserFollowService,
        private userService: UserService,
        private pageService: PageService
    ) {
        super();
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                // let searchOfficialOnly: number = undefined;
                let userId = undefined;
                // get startDateTime, endDateTime
                if (this.data !== undefined && this.data !== null) {
                    userId = this.data.userId;
                }
                const objIds = new ObjectID(userId);
                let limit: number = undefined;
                let offset: number = undefined;
                if (this.data !== undefined && this.data !== null) {
                    offset = this.data.offsets;
                }
                limit = (limit === undefined || limit === null) ? this.data.limits : this.DEFAULT_SEARCH_LIMIT;
                offset = this.data.offsets ? this.data.offsets : this.DEFAULT_SEARCH_OFFSET;
                const searchFilter: SearchFilter = new SearchFilter();
                searchFilter.limit = limit;
                searchFilter.offset = offset;
                searchFilter.orderBy = {
                    summationScore: 1
                };
                searchFilter.whereConditions = {
                    isClose: false
                };

                const searchCountFilter: SearchFilter = new SearchFilter();
                searchCountFilter.count = true;
                searchCountFilter.whereConditions = {
                    isClose: false
                };
                // const today = moment().add(month, 'month').toDate();

                const isFollowing = await this.userFollowService.aggregate([
                    {
                        $match: {
                            userId: objIds
                        }
                    },
                    {
                        $skip: this.data.offsetFollows
                    },
                    {
                        $limit: this.data.limitFollows
                    },
                    {
                        $project: {
                            subjectId: 1,
                            subjectType: 1,
                            _id: 0
                        }
                    },
                ]);
                // USER
                // PAGE 
                // db.Page.aggregate([{$match:{'isOfficial':true}},{'$lookup':{from:'Posts','let':{'id':'$_id'},'pipeline':[{'$match':{'$expr':{'$eq':['$$id','$pageId']}}},{$limit:1}],as:'Posts'}},{$unwind: { path: '$Posts', preserveNullAndEmptyArrays: true }}])
                // EMERGENCY_EVENT
                // OBJECTIVE
                const userIds = [];
                const pageIds = [];
                const emegencyIds = [];
                const objectiveIds = [];
                if (isFollowing.length > 0) {
                    for (let i = 0; i < isFollowing.length; i++) {
                        if (isFollowing[i].subjectType === 'USER') {
                            // userIds.push((new ObjectID(isFollowing[i].subjectId)));
                        }
                        if (isFollowing[i].subjectType === 'PAGE') {
                            pageIds.push((new ObjectID(isFollowing[i].subjectId)));
                        }
                        if (isFollowing[i].subjectType === 'EMERGENCY_EVENT') {
                            // emegencyIds.push((new ObjectID(isFollowing[i].subjectId)));
                        } if (isFollowing[i].subjectType === 'OBJECTIVE') {
                            // objectiveIds.push((new ObjectID(isFollowing[i].subjectId)));
                        } else {
                            continue;
                        }
                    }
                }
                let pageFollowingContents = undefined;
                let userFollowingContents = undefined;
                let emergencyFollowingContents = undefined;
                let objectiveFollowingContents = undefined;
                if (pageIds.length > 0) {
                    pageFollowingContents = await this.pageService.aggregate(
                        [
                            {
                                $match: {
                                    _id: { $in: pageIds },
                                },
                            },
                            {
                                $lookup: {
                                    from: 'Posts',
                                    let: { id: '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$id', '$pageId'],
                                                },
                                            },
                                        },
                                        {
                                            $sort: {
                                                summationScore: -1
                                            },
                                        },
                                        {
                                            $skip: offset
                                        },
                                        {
                                            $limit: limit,

                                        },
                                        {
                                            $lookup: {
                                                from: 'Page',
                                                localField: 'pageId',
                                                foreignField: '_id',
                                                as: 'page'
                                            }
                                        },
                                        {
                                            $lookup: {
                                                from: 'PostsGallery',
                                                localField: '_id',
                                                foreignField: 'post',
                                                as: 'gallery',
                                            },
                                        },
                                        {
                                            $lookup: {
                                                from: 'User',
                                                let: { ownerUser: '$ownerUser' },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: { $eq: ['$$ownerUser', '$_id'] },
                                                        },

                                                    },
                                                    { $project: { email: 0, username: 0, password: 0 } }
                                                ],
                                                as: 'user'
                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: '$user',
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                        {
                                            $project: {
                                                story: 0
                                            }

                                        },
                                    ],
                                    as: 'posts',
                                },
                            },
                            {
                                $addFields: {
                                    'page.posts': '$posts',
                                },
                            },
                            {
                                $project: {
                                    posts: 0,
                                },
                            },
                        ]);
                }
                if (userIds.length > 0) {
                    userFollowingContents = await this.userService.aggregate(
                        [
                            {
                                $match: {
                                    _id: { $in: userIds }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Posts',
                                    let: { id: '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$id', '$ownerUser']
                                                },
                                            }
                                        },
                                        {
                                            $sort: {
                                                summationScore: -1
                                            },
                                        },
                                        {
                                            $skip: offset
                                        },
                                        {
                                            $limit: limit,

                                        },
                                        {
                                            $lookup: {
                                                from: 'PostsGallery',
                                                localField: '_id',
                                                foreignField: 'post',
                                                as: 'gallery',
                                            },
                                        },
                                        {
                                            $lookup: {
                                                from: 'User',
                                                let: { ownerUser: '$ownerUser' },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: { $eq: ['$$ownerUser', '$_id'] },
                                                        },

                                                    },
                                                    { $project: { email: 0, username: 0, password: 0 } }
                                                ],
                                                as: 'user'
                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: '$user',
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                        {
                                            $project: {
                                                story: 0
                                            }

                                        },
                                    ],
                                    as: 'posts'
                                }
                            }, {
                                $addFields: {
                                    'user.posts': '$posts',
                                },
                            },
                            {
                                $project: {
                                    posts: 0
                                }
                            }
                        ]
                    );
                }
                if (emegencyIds.length > 0) {
                    emergencyFollowingContents = await this.emergencyEventService.aggregate(
                        [
                            {
                                $match: {
                                    _id: { $in: emegencyIds }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Posts',
                                    let: { id: '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $eq: ['$$id', '$emergencyEvent'] }
                                            }
                                        },
                                        {
                                            $sort: {
                                                summationScore: -1
                                            },
                                        },
                                        {
                                            $skip: offset
                                        },
                                        {
                                            $limit: limit,

                                        },
                                        {
                                            $lookup: {
                                                from: 'PostsGallery',
                                                localField: '_id',
                                                foreignField: 'post',
                                                as: 'gallery',
                                            },
                                        },
                                        {
                                            $lookup: {
                                                from: 'User',
                                                let: { ownerUser: '$ownerUser' },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: { $eq: ['$$ownerUser', '$_id'] },
                                                        },

                                                    },
                                                    { $project: { email: 0, username: 0, password: 0 } }
                                                ],
                                                as: 'user'
                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: '$user',
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                        {
                                            $project: {
                                                story: 0
                                            }

                                        },
                                    ],
                                    as: 'posts'
                                },
                            }
                        ]
                    );
                }
                if (objectiveIds.length > 0) {
                    objectiveFollowingContents = await this.pageObjectiveService.aggregate(
                        [
                            {
                                $match: {
                                    _id: { $in: objectiveIds }
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Posts',
                                    let: { id: '$_id' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: { $eq: ['$$id', '$objective'] }
                                            }
                                        },
                                        {
                                            $sort: {
                                                summationScore: -1
                                            },
                                        },
                                        {
                                            $skip: offset
                                        },
                                        {
                                            $limit: limit,

                                        },
                                        {
                                            $lookup: {
                                                from: 'PostsGallery',
                                                localField: '_id',
                                                foreignField: 'post',
                                                as: 'gallery',
                                            },
                                        },
                                        {
                                            $lookup: {
                                                from: 'User',
                                                let: { ownerUser: '$ownerUser' },
                                                pipeline: [
                                                    {
                                                        $match: {
                                                            $expr: { $eq: ['$$ownerUser', '$_id'] },
                                                        },

                                                    },
                                                    { $project: { email: 0, username: 0, password: 0 } }
                                                ],
                                                as: 'user'
                                            }
                                        },
                                        {
                                            $unwind: {
                                                path: '$user',
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                        {
                                            $project: {
                                                story: 0
                                            }

                                        },
                                    ],
                                    as: 'posts'
                                }
                            }
                        ]
                    );
                }
                if (pageFollowingContents === undefined) {
                    const pageIdsState = [];
                    let limitState = 2;
                    let offsetState = 2;
                    async function createMachine(stateMachineDefintion: any): Promise<any> {
                        const actions = {};
                        const transitions = {};
                        for (const [state, definition] of Object.entries(stateMachineDefintion)) {
                            actions[state] = state || {};
                            transitions[state] = definition || {};
                        }
                        return {
                            currentState: stateMachineDefintion.initialState,
                            value: stateMachineDefintion.initialState,
                            actions,
                            transitions,

                            transition(action: any): any {
                                const current = this.currentState;
                                const transitionData = this.transitions[current][action];
                                if (!transitionData) {
                                    console.error(`Invalid transition from state ${current} with action ${action}`);
                                    return this.value;
                                }
                                const { target, action: transitionAction } = transitionData;

                                // execute transition action if present
                                if (transitionAction) {
                                    transitionAction();
                                }
                                if (this.actions[target] && this.actions[target][action]) {
                                    this.actions[target][action]();
                                }

                                this.currentState = target;
                                this.value = target;
                                return this.value;
                            }
                        };
                    }
                    const machine: any = await createMachine({
                        initialState: 'start',
                        start: {
                            actions: {
                                openBracket(): any {
                                    console.log('Start state: open bracket');
                                },
                            },
                            transitions: {
                                'undefined': { target: 'undefined', action: () => console.log('Transition to undefined state') }
                            },
                        },
                        undefined: {
                            actions: {
                                undefined(char: any): any {
                                    console.log('undefined state:', char);
                                },
                                closeBracket(): any {
                                    console.log('Close bracket undefined state');
                                },
                            },
                            transitions: {
                                'end': { target: 'end', action: () => console.log('Transition to end state') }
                            },
                        },
                        end: {
                            actions: {
                                closeBracket(): any {
                                    console.log('Close bracket end state');
                                }
                            }
                        }
                    });
                    const findFollowNextState = await this.userFollowService.aggregate(
                        [
                            {
                                $match: {
                                    userId: objIds,
                                    subjectId: { $ne: pageIds }
                                }
                            },
                            {
                                $skip: this.data.offsetFollows + offsetState
                            },
                            {
                                $limit: this.data.limitFollows + limitState
                            },
                            {
                                $project: {
                                    subjectId: 1,
                                    subjectType: 1,
                                    _id: 0
                                }
                            },
                        ]);
                    async function checkPost(post: any): Promise<any> {
                        if (post.length > 0) {
                            return 'end';
                        } else {
                            return 'undefined';
                        }
                    }

                    if (findFollowNextState.length > 0) {
                        for (let i = 0; i < findFollowNextState.length; i++) {
                            if (findFollowNextState[i].subjectType === 'PAGE') {
                                pageIdsState.push((new ObjectID(findFollowNextState[i].subjectId)));
                            }
                        }
                    }
                    if (pageIdsState.length > 0) {
                        pageFollowingContents = await this.pageService.aggregate(
                            [
                                {
                                    $match: {
                                        _id: { $in: pageIdsState },
                                    },
                                },
                                {
                                    $lookup: {
                                        from: 'Posts',
                                        let: { id: '$_id' },
                                        pipeline: [
                                            {
                                                $match: {
                                                    $expr: {
                                                        $eq: ['$$id', '$pageId'],
                                                    },
                                                },
                                            },
                                            {
                                                $sort: {
                                                    summationScore: -1
                                                },
                                            },
                                            {
                                                $skip: offset
                                            },
                                            {
                                                $limit: limit,

                                            },
                                            {
                                                $lookup: {
                                                    from: 'Page',
                                                    localField: 'pageId',
                                                    foreignField: '_id',
                                                    as: 'page'
                                                }
                                            },
                                            {
                                                $lookup: {
                                                    from: 'PostsGallery',
                                                    localField: '_id',
                                                    foreignField: 'post',
                                                    as: 'gallery',
                                                },
                                            },
                                            {
                                                $lookup: {
                                                    from: 'User',
                                                    let: { ownerUser: '$ownerUser' },
                                                    pipeline: [
                                                        {
                                                            $match: {
                                                                $expr: { $eq: ['$$ownerUser', '$_id'] },
                                                            },

                                                        },
                                                        { $project: { email: 0, username: 0, password: 0 } }
                                                    ],
                                                    as: 'user'
                                                }
                                            },
                                            {
                                                $unwind: {
                                                    path: '$user',
                                                    preserveNullAndEmptyArrays: true
                                                }
                                            },
                                            {
                                                $project: {
                                                    story: 0
                                                }

                                            },
                                        ],
                                        as: 'posts',
                                    },
                                },
                                {
                                    $addFields: {
                                        'page.posts': '$posts',
                                    },
                                },
                                {
                                    $project: {
                                        posts: 0,
                                    },
                                },
                            ]);
                    }
                    let stateMachine = machine.value;
                    const posting = await checkPost(pageFollowingContents);
                    if (posting !== 'end') {
                        stateMachine = machine.transition(posting);
                        console.log('posting', posting);
                        console.log('stateMachine', stateMachine);
                    } else {
                        limitState += 2;
                        offsetState += 2;
                    }
                }
                const stackPosts = [];
                if (pageFollowingContents !== undefined) {
                    for (const stacks of pageFollowingContents) {
                        stackPosts.push(stacks.page.posts);
                    }
                }
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'ข่าวสารก่อนหน้านี้' : this.config.title;
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = 'ข่าวสารก่อนหน้านี้'; // set type by processor type
                const lastestDate = null;
                if (stackPosts.length > 0) {
                    for (const row of stackPosts.flat()) {
                        const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                        const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                        const contents: any = {};
                        contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                        if (firstImage !== undefined && firstImage.s3ImageURL !== undefined && firstImage.s3ImageURL !== '') {
                            try {
                                const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3ImageURL);
                                contents.coverPageSignUrl = signUrl;
                            } catch (error) {
                                console.log('PostSectionProcessor: ' + error);
                            }
                        }

                        // search isLike
                        row.isLike = false;
                        if (userId !== undefined && userId !== undefined && userId !== '') {
                            const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                            if (userLikes.length > 0) {
                                row.isLike = true;
                            }
                        }

                        contents.owner = {};
                        if (row.page !== undefined) {
                            contents.owner = this.parsePageField(row.page);
                        } else {
                            contents.owner = this.parseUserField(user);
                        }
                        // remove page agg
                        // delete row.page;
                        delete row.user;
                        contents.post = row;
                        result.contents.push(contents);
                    }
                }
                result.dateTime = lastestDate;
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
    private parsePageField(page: any): any {
        const pageResult: any = {};

        if (page !== undefined) {
            pageResult.id = page[0]._id;
            pageResult.name = page[0].name;
            pageResult.imageURL = page[0].imageURL;
            pageResult.isOfficial = page[0].isOfficial;
            pageResult.uniqueId = page[0].pageUsername;
            pageResult.type = 'PAGE';
        }

        return pageResult;
    }

    private parseUserField(user: any): any {
        const userResult: any = {};

        if (user !== undefined) {
            userResult.id = user._id;
            userResult.displayName = user.displayName;
            userResult.imageURL = user.imageURL;
            userResult.email = user.email;
            userResult.isAdmin = user.isAdmin;
            userResult.uniqueId = user.uniqueId;
            userResult.type = 'USER';
        }

        return userResult;
    }

}
