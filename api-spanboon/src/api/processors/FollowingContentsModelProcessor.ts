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
import { UserFollowService } from '../services/UserFollowService';
import { UserLike } from '../models/UserLike';
import { ObjectID } from 'mongodb';
import { LIKE_TYPE } from '../../constants/LikeType';
import { UserLikeService } from '../services/UserLikeService';
export class FollowingContentsModelProcessor extends AbstractSeparateSectionProcessor {
    private DEFAULT_SEARCH_LIMIT = 10;
    private DEFAULT_SEARCH_OFFSET = 0;
    constructor(
        private s3Service: S3Service,
        private userFollowService: UserFollowService,
        private userLikeService: UserLikeService,
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
                let isReadPostIds = undefined;
                let limit: number = undefined;
                let offset: number = undefined;
                if (this.data !== undefined && this.data !== null) {
                    offset = this.data.offsets;
                    isReadPostIds = this.data.postIds;
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
                let postIds = undefined;
                if (isReadPostIds.length > 0) {
                    for (let i = 0; i < isReadPostIds.length; i++) {
                        const mapIds = isReadPostIds[i].postId.map(ids => new ObjectID(ids));
                        postIds = mapIds;
                    }
                }
                const following = await this.userFollowService.aggregate([{
                    $match: {
                        userId: objIds
                    }
                }]);
                // const today = moment().add(month, 'month').toDate();
                let isFollowing = undefined;
                if (postIds !== undefined && postIds.length > 0) {
                    if (following.length > 1) {
                        isFollowing = await this.userFollowService.aggregate([
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
                                $lookup: {
                                    from: 'Page',
                                    let: { subjectId: '$subjectId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$subjectId', '$_id']
                                                }
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
                                                                $eq: ['$$id', '$pageId']
                                                            },
                                                        },
                                                    },
                                                    {
                                                        $match: {
                                                            _id: { $nin: postIds },
                                                            isDraft: false,
                                                            deleted: false,
                                                            hidden: false,
                                                        }
                                                    },
                                                    {
                                                        $sort: {
                                                            summationScore: -1,
                                                        },
                                                    },
                                                    {
                                                        $skip: offset
                                                    },
                                                    {
                                                        $limit: limit + offset,

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
                                        },
                                        {
                                            $unwind: {
                                                path: '$posts',
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                    ],
                                    as: 'page'
                                },
                            },
                            {
                                $unwind: {
                                    path: '$page',
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                            {
                                $lookup: {
                                    from: 'User',
                                    let: { subjectId: '$subjectId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$subjectId', '$_id']
                                                }
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
                                                                $eq: ['$$id', '$ownerUser']
                                                            }
                                                        }
                                                    },
                                                    {
                                                        $match: {
                                                            isDraft: false,
                                                            deleted: false,
                                                            hidden: false,
                                                        }
                                                    },
                                                    {
                                                        $sort: {
                                                            createdDate: -1,
                                                        },
                                                    },
                                                    {
                                                        $limit: 8

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
                                        },
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
                        ]);
                    } else {
                        isFollowing = await this.userFollowService.aggregate([
                            {
                                $match: {
                                    userId: objIds
                                }
                            },
                            {
                                $lookup: {
                                    from: 'Page',
                                    let: { subjectId: '$subjectId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$subjectId', '$_id']
                                                }
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
                                                                $eq: ['$$id', '$pageId']
                                                            },
                                                        },
                                                    },
                                                    {
                                                        $match: {
                                                            _id: { $nin: postIds },
                                                            isDraft: false,
                                                            deleted: false,
                                                            hidden: false,
                                                        }
                                                    },
                                                    {
                                                        $sort: {
                                                            summationScore: -1,
                                                        },
                                                    },
                                                    {
                                                        $skip: offset
                                                    },
                                                    {
                                                        $limit: limit + offset,

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
                                        },
                                        {
                                            $unwind: {
                                                path: '$posts',
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                    ],
                                    as: 'page'
                                },
                            },
                            {
                                $unwind: {
                                    path: '$page',
                                    preserveNullAndEmptyArrays: true
                                }
                            },
                        ]);
                    }
                } else {
                    isFollowing = await this.userFollowService.aggregate([
                        {
                            $match: {
                                userId: objIds
                            }
                        },
                        {
                            $lookup: {
                                from: 'Page',
                                let: { subjectId: '$subjectId' },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$$subjectId', '$_id']
                                            }
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
                                                            $eq: ['$$id', '$pageId']
                                                        },
                                                    },
                                                },
                                                {
                                                    $match: {
                                                        isDraft: false,
                                                        deleted: false,
                                                        hidden: false,
                                                    }
                                                },
                                                {
                                                    $sort: {
                                                        summationScore: -1,
                                                    },
                                                },
                                                {
                                                    $skip: offset
                                                },
                                                {
                                                    $limit: limit + offset,

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
                                    },
                                    {
                                        $unwind: {
                                            path: '$posts',
                                            preserveNullAndEmptyArrays: true
                                        }
                                    },
                                ],
                                as: 'page'
                            },
                        },
                        {
                            $unwind: {
                                path: '$page',
                                preserveNullAndEmptyArrays: true
                            }
                        },
                    ]);
                }
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'ข่าวสารก่อนหน้านี้' : this.config.title;
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = 'ข่าวสารก่อนหน้านี้'; // set type by processor type
                const lastestDate = null;
                if (isFollowing.length > 0) {
                    for (const row of isFollowing) {
                        if (row.subjectType === 'PAGE' && row.page.posts !== undefined && row.page !== undefined) {
                            const firstImage = (row.page.posts.gallery.length > 0) ? row.page.posts.gallery[0] : undefined;

                            const contents: any = {};
                            contents.coverPageUrl = (row.page.posts.gallery.length > 0) ? row.page.posts.gallery[0].imageURL : undefined;
                            if (firstImage !== undefined && firstImage.s3ImageURL !== undefined && firstImage.s3ImageURL !== '') {
                                try {
                                    const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3ImageURL);
                                    contents.coverPageSignUrl = signUrl;
                                } catch (error) {
                                    console.log('PostSectionProcessor: ' + error);
                                }
                            }

                            // search isLike
                            row.page.posts.isLike = false;
                            if (userId !== undefined && userId !== undefined && userId !== '') {
                                const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                                if (userLikes.length > 0) {
                                    row.isLike = true;
                                }
                            }

                            contents.owner = {};
                            if (row.page !== undefined) {
                                contents.owner = this.parsePageField(row.page);
                            }
                            // remove page agg
                            // delete row.page;
                            delete row.user;
                            contents.post = row.page.posts;
                            result.contents.push(contents);
                        } else if (row.subjectType === 'USER' && row.user !== undefined) {
                            const contents: any = {};
                            contents.owner = {};
                            contents.owner = await this.parseUserField(row.user);
                            result.contents.push(contents);
                        }
                    }
                }
                if (result.contents.length === 0) {
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
                                    userId: objIds
                                }
                            },
                            {
                                $skip: this.data.offsetFollows + offsetState
                            },
                            {
                                $limit: this.data.limitFollows + limitState
                            },
                            {
                                $lookup: {
                                    from: 'Page',
                                    let: { subjectId: '$subjectId' },
                                    pipeline: [
                                        {
                                            $match: {
                                                $expr: {
                                                    $eq: ['$$subjectId', '$_id']
                                                }
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
                                                                $eq: ['$$id', '$pageId']
                                                            },
                                                        },
                                                    },
                                                    {
                                                        $match: {
                                                            _id: { $nin: postIds }
                                                        }
                                                    },
                                                    {
                                                        $sort: {
                                                            summationScore: -1,
                                                        },
                                                    },
                                                    {
                                                        $skip: offset
                                                    },
                                                    {
                                                        $limit: limit + offset,

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
                                        },
                                        {
                                            $unwind: {
                                                path: '$posts',
                                                preserveNullAndEmptyArrays: true
                                            }
                                        },
                                    ],
                                    as: 'page'
                                },
                            },
                            {
                                $unwind: {
                                    path: '$page',
                                    preserveNullAndEmptyArrays: true
                                }
                            }
                        ]);
                    async function checkPost(post: any): Promise<any> {
                        if (post.length > 0) {
                            return 'end';
                        } else {
                            return 'undefined';
                        }
                    }
                    let stateMachine = machine.value;
                    const posting = await checkPost(findFollowNextState);
                    if (posting !== 'end') {
                        stateMachine = machine.transition(posting);
                        console.log('stateMachine', stateMachine);
                    } else {
                        limitState += 2;
                        offsetState += 2;
                    }
                    if (findFollowNextState.length > 0) {
                        for (const row of findFollowNextState) {
                            if (row.subjectType === 'PAGE' && row.page.posts !== undefined && row.page !== undefined) {
                                const firstImage = (row.page.posts.gallery.length > 0) ? row.page.posts.gallery[0] : undefined;

                                const contents: any = {};
                                contents.coverPageUrl = (row.page.posts.gallery.length > 0) ? row.page.posts.gallery[0].imageURL : undefined;
                                if (firstImage !== undefined && firstImage.s3ImageURL !== undefined && firstImage.s3ImageURL !== '') {
                                    try {
                                        const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3ImageURL);
                                        contents.coverPageSignUrl = signUrl;
                                    } catch (error) {
                                        console.log('PostSectionProcessor: ' + error);
                                    }
                                }

                                // search isLike
                                row.page.posts.isLike = false;
                                if (userId !== undefined && userId !== undefined && userId !== '') {
                                    const userLikes: UserLike[] = await this.userLikeService.find({ userId: new ObjectID(userId), subjectId: row._id, subjectType: LIKE_TYPE.POST });
                                    if (userLikes.length > 0) {
                                        row.isLike = true;
                                    }
                                }

                                contents.owner = {};
                                if (row.page !== undefined) {
                                    contents.owner = this.parsePageField(row.page);
                                }
                                // remove page agg
                                // delete row.page;
                                delete row.user;
                                contents.post = row.page.posts;
                                result.contents.push(contents);
                            } else if (row.subjectType === 'USER' && row.page !== undefined) {
                                const contents: any = {};
                                contents.owner = {};
                                contents.owner = await this.parseUserField(row.user);
                                result.contents.push(contents);
                            }
                        }
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
            pageResult.id = page._id;
            pageResult.name = page.name;
            pageResult.imageURL = page.imageURL;
            pageResult.isOfficial = page.isOfficial;
            pageResult.uniqueId = page.pageUsername;
            pageResult.type = 'PAGE';
        }

        return pageResult;
    }

    private async parseUserField(user: any): Promise<any> {
        console.log('user', user.posts);
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
        }
        for (const row of user.posts) {
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

        return userResult;
    }

}
