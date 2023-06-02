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
// import { UserLike } from '../models/UserLike';
import { ObjectID } from 'mongodb';
import { PageService } from '../services/PageService';
import { EmergencyEventService } from '../services/EmergencyEventService';
// import { EmergencyEventService } from '../services/EmergencyEventService';
export class FollowingContentsModelProcessor extends AbstractSeparateSectionProcessor {
    private DEFAULT_SEARCH_LIMIT = 10;
    private DEFAULT_SEARCH_OFFSET = 0;
    constructor(
        // private postsService: PostsService,
        private s3Service: S3Service,
        // private userLikeService: UserLikeService,
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
                                pageIds.push((new ObjectID(findFollowNextState[i].subjectId)));
                            }
                        }
                    }
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
                    if (posting) {
                        stateMachine = machine.transition(posting);
                    }
                    console.log('posting', posting);
                    console.log('stateMachine', stateMachine);
                }
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'ข่าวสารก่อนหน้านี้' : this.config.title;
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = 'ข่าวสารก่อนหน้านี้'; // set type by processor type
                const lastestDate = null;
                if (pageFollowingContents !== undefined) {
                    for (const rows of pageFollowingContents) {
                        if (rows.page.posts.length > 0) {
                            const contents: any = {};
                            contents.owner = {};
                            if (rows.page !== undefined) {
                                contents.owner = await this.parsePageField(rows, rows.page.posts);
                            }
                            result.contents.push(contents);
                        }
                    }
                }
                if (userFollowingContents !== undefined) {
                    for (const rows of userFollowingContents) {
                        const contents: any = {};
                        contents.owner = {};
                        if (rows !== undefined) {
                            contents.owner = await this.parseUserField(rows, rows.user.posts);
                        }
                        result.contents.push(contents);
                    }
                }
                if (emergencyFollowingContents !== undefined) {
                    for (const rows of emergencyFollowingContents) {
                        const contents: any = {};
                        contents.owner = {};
                        if (rows !== undefined) {
                            contents.owner = await this.parseEmergencyField(rows, rows.posts);
                        }
                        result.contents.push(contents);
                    }
                }
                if (objectiveFollowingContents !== undefined) {
                    for (const rows of objectiveFollowingContents) {
                        const contents: any = {};
                        contents.owner = {};
                        if (rows !== undefined) {
                            contents.owner = await this.parseObjectiveField(rows, rows.posts);
                        }
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
    private async parsePageField(page: any, posts: any): Promise<any> {
        const pageResult: any = {};
        if (page !== undefined) {
            pageResult.id = page._id;
            pageResult.name = page.name;
            pageResult.imageURL = page.imageURL;
            pageResult.isOfficial = page.isOfficial;
            pageResult.uniqueId = page.pageUsername;
            pageResult.type = 'PAGE';
            pageResult.posts = [];
            for (const row of posts) {
                const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;
                const contents: any = {};
                contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                if (firstImage !== undefined && firstImage.s3ImageURL !== undefined) {
                    try {
                        const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3ImageURL);
                        contents.coverPageSignUrl = signUrl;
                    } catch (error) {
                        console.log('PostSectionProcessor: ' + error);
                    }
                }
                row.isLike = false;
                contents.post = row;
                pageResult.posts.push(contents);
            }
        }

        return pageResult;
    }

    private async parseUserField(user: any, posts: any): Promise<any> {
        const userResult: any = {};

        if (user !== undefined) {
            userResult.id = user._id;
            userResult.displayName = user.displayName;
            userResult.imageURL = user.imageURL;
            userResult.email = user.email;
            userResult.isAdmin = user.isAdmin;
            userResult.uniqueId = user.uniqueId;
            userResult.type = 'USER';
            userResult.posts = [];
            for (const row of posts) {
                const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;
                const contents: any = {};
                contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                if (firstImage !== undefined && firstImage.s3ImageURL !== undefined) {
                    try {
                        const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3ImageURL);
                        contents.coverPageSignUrl = signUrl;
                    } catch (error) {
                        console.log('PostSectionProcessor: ' + error);
                    }
                }
                row.isLike = false;
                contents.post = row;
                userResult.posts.push(contents);
            }

        }

        return userResult;
    }
    private async parseEmergencyField(emergency: any, posts: any): Promise<any> {
        const emergencyResult: any = {};
        if (emergency !== undefined) {
            emergencyResult.id = emergency._id;
            emergencyResult.title = emergency.title;
            emergencyResult.detail = emergency.detail;
            emergencyResult.hashtag = emergency.hashTag;
            emergencyResult.isPin = emergency.isPin;
            emergencyResult.coverPageURL = emergency.coverPageURL;
            emergencyResult.s3CoverPageURL = emergency.s3CoverPageURL;
            emergencyResult.type = 'EMERGENCY';
            emergencyResult.posts = [];
            for (const row of posts) {
                const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;
                const contents: any = {};
                contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                if (firstImage !== undefined && firstImage.s3ImageURL !== undefined) {
                    try {
                        const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3ImageURL);
                        contents.coverPageSignUrl = signUrl;
                    } catch (error) {
                        console.log('PostSectionProcessor: ' + error);
                    }
                }
                row.isLike = false;
                contents.post = row;
                emergencyResult.posts.push(contents);
            }
        }
        return emergencyResult;
    }
    private async parseObjectiveField(objective: any, posts: any): Promise<any> {
        const objectiveResult: any = {};
        if (objective !== undefined) {
            objectiveResult.id = objective._id;
            objectiveResult.pageId = objective.pageId;
            objectiveResult.title = objective.title;
            objectiveResult.detail = objective.detail;
            objectiveResult.iconURL = objective.iconURL;
            objectiveResult.category = objective.category;
            objectiveResult.hashTag = objective.hashTag;
            objectiveResult.s3IconURL = objective.s3IconURL;
            objectiveResult.posts = [];
            for (const row of posts) {
                const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;
                const contents: any = {};
                contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                if (firstImage !== undefined && firstImage.s3ImageURL !== undefined) {
                    try {
                        const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3ImageURL);
                        contents.coverPageSignUrl = signUrl;
                    } catch (error) {
                        console.log('PostSectionProcessor: ' + error);
                    }
                }
                row.isLike = false;
                contents.post = row;
                objectiveResult.posts.push(contents);

            }
        }
        return objectiveResult;
    }

}
