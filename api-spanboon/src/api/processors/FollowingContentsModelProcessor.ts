/*
 * @license Spanboon Platform v0.1
 * (c) 2020-2021 KaoGeek. http://kaogeek.dev
 * License: MIT. https://opensource.org/licenses/MIT
 * Author:  shiorin <junsuda.s@absolute.co.th>, chalucks <chaluck.s@absolute.co.th>
 */

import { AbstractSeparateSectionProcessor } from './AbstractSeparateSectionProcessor';
import { SectionModel } from '../models/SectionModel';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';

// import { S3Service } from '../services/S3Service';
// import { UserService } from '../services/UserService';
// import { UserFollowService } from '../services/UserFollowService';
// import { PageObjectiveService } from '../services/PageObjectiveService';
// import { UserLikeService } from '../services/UserLikeService';
// import { UserLike } from '../models/UserLike';
// import { LIKE_TYPE } from '../../constants/LikeType';
// import { ObjectID } from 'mongodb';
// import { PageService } from '../services/PageService';
// import { EmergencyEventService } from '../services/EmergencyEventService';
export class FollowingContentsModelProcessor extends AbstractSeparateSectionProcessor {
    private DEFAULT_SEARCH_LIMIT = 10;
    private DEFAULT_SEARCH_OFFSET = 0;
    constructor(
        // private postsService: PostsService,
        /* 
        private s3Service: S3Service,
        private userLikeService: UserLikeService,
        private emergencyEventService: EmergencyEventService,
        private pageObjectiveService: PageObjectiveService,
        private userFollowService: UserFollowService,
        private userService: UserService,
        private pageService: PageService */
    ) {
        super();
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                // let searchOfficialOnly: number = undefined;
                // let userId = undefined;
                let contentPost = undefined;
                // get startDateTime, endDateTime
                if (this.data !== undefined && this.data !== null) {
                    // userId = this.data.userId;
                    contentPost = this.data.contentPost;
                }
                // const objIds = new ObjectID(userId);
                let limit: number = undefined;
                let offset: number = undefined;
                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.limit === 'number') {
                        limit = this.config.limit;
                    }

                    if (typeof this.config.offset === 'number') {
                        offset = this.config.offset;
                    }
                    /* 
                    if (typeof this.config.searchOfficialOnly === 'boolean') {
                        searchOfficialOnly = this.config.searchOfficialOnly;
                    } */
                }

                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : this.DEFAULT_SEARCH_LIMIT;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;
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
                const contents = [];
                if (contentPost.length > 0) {
                    for (const rows of contentPost) {
                        contents.push(rows.owner.posts);
                    }
                }
                // console.log('contents',contents);
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'เพราะคุณติดตาม' : this.config.title;
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = 'Following'; // set type by processor type
                const lastestDate = null;

                result.dateTime = lastestDate;
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
    }
    /* 
    private async parsePageField(all: any): Promise<any> {
        const pageResult: any = {};
        if (all !== undefined) {
            pageResult.id = all._id;
            pageResult.name = all.displayName;
            pageResult.imageURL = all.imageURL;
            pageResult.uniqueId = all.uniqueId;
            pageResult.type = 'All';
        }

        return pageResult;
    } */
}
