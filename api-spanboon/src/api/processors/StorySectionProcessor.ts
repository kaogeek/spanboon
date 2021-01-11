import { SectionModel } from '../models/SectionModel';
import { ContentModel } from '../models/ContentModel';
import { AbstractSectionModelProcessor } from './AbstractSectionModelProcessor';
import { StorySectionProcessorData } from './data/StorySectionProcessorData';
import { PostsService } from '../services/PostsService';
import { HashTagService } from '../services/HashTagService';
import { SearchFilter } from '../controllers/requests/SearchFilterRequest';
import { ObjectID } from 'mongodb';
import moment from 'moment';

export class StorySectionProcessor extends AbstractSectionModelProcessor {

    private DEFAULT_SEARCH_LIMIT = 4;
    private DEFAULT_SEARCH_OFFSET = 0;

    constructor(
        private postsService: PostsService,
        private hashTagService: HashTagService,
    ) {
        super();
    }

    public setData(data: StorySectionProcessorData): void {
        this.data = data;
    }

    // new post which user follow
    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config
                let limit: number = undefined;
                let offset: number = undefined;
                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.limit === 'number') {
                        limit = this.config.limit;
                    }

                    if (typeof this.config.offset === 'number') {
                        offset = this.config.offset;
                    }
                }

                limit = (limit === undefined || limit === null) ? this.DEFAULT_SEARCH_LIMIT : limit;
                offset = (offset === undefined || offset === null) ? this.DEFAULT_SEARCH_OFFSET : offset;

                let postId: string = undefined;
                let hashTag: string[] = undefined;// as a hashtag string not id
                if (this.data !== undefined && this.data !== null) {
                    hashTag = this.data.hashTag;
                    postId = this.data.postId;
                }

                const today = moment().toDate();
                const matchStmt: any = {
                    isDraft: false,
                    deleted: false,
                    hidden: false,
                    startDateTime: { $lte: today }
                };

                if (postId !== undefined && postId !== '') {
                    const referencePost = await this.postsService.findOne({ _id: new ObjectID(postId) });
                    if (referencePost !== undefined) {
                        if (referencePost.postsHashTags !== undefined) {
                            const hashTagSearchFilter = new SearchFilter();
                            hashTagSearchFilter.whereConditions = {
                                id: { $in: referencePost.postsHashTags }
                            };

                            const hashTagList = await this.hashTagService.search(hashTagSearchFilter);
                            if (hashTag === undefined) {
                                hashTag = [];
                            }
                            for (const ht of hashTagList) {
                                hashTag.push(ht.name);
                            }
                        }
                    }
                }

                if (hashTag !== undefined && hashTag.length > 0) {
                    const hashTagOrArray = [];
                    for (const ht of hashTag) {
                        const stmt = { detail: { $regex: '.*' + ht + '.*', $options: 'si' } };
                        hashTagOrArray.push(stmt);
                    }
                    if (hashTagOrArray.length > 0) {
                        matchStmt['$or'] = hashTagOrArray;
                    }
                }

                const postStmt = [
                    { $match: matchStmt },
                    { $limit: limit },
                    { $skip: offset },
                    { $sort: { createdDate: -1 } },
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
                            from: 'User',
                            localField: 'ownerUser',
                            foreignField: '_id',
                            as: 'user'
                        }
                    },
                    {
                        $lookup: {
                            from: 'PostsGallery',
                            localField: '_id',
                            foreignField: 'post',
                            as: 'gallery'
                        }
                    }
                ];
                const searchResult = await this.postsService.aggregate(postStmt);

                let lastestDate = null;

                const result: SectionModel = new SectionModel();
                result.title = 'เรื่องราวที่คุณอาจสนใจ';
                result.iconUrl = '';
                result.subtitle = '';
                result.description = '';
                result.contents = [];
                for (const row of searchResult) {
                    const page = (row.page !== undefined && row.page.length > 0) ? row.page[0] : undefined;
                    const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                    const firstImg = (row.gallery !== undefined && row.gallery.length > 0) ? row.gallery[0] : undefined;

                    if (lastestDate === null) {
                        lastestDate = row.createdDate;
                    }
                    const contentModel = new ContentModel();
                    contentModel.commentCount = row.commentCount;
                    contentModel.repostCount = row.repostCount;
                    contentModel.shareCount = row.shareCount;
                    contentModel.likeCount = row.likeCount;
                    contentModel.viewCount = row.viewCount;

                    contentModel.post = row;
                    contentModel.dateTime = row.createdDate;

                    if (firstImg) {
                        contentModel.coverPageUrl = firstImg.imageURL;
                    }

                    contentModel.owner = {};
                    if (page !== undefined) {
                        contentModel.owner = this.parsePageField(page);
                    } else if (user !== undefined) {
                        contentModel.owner = this.parseUserField(user);
                    }

                    delete contentModel.post.story;
                    delete contentModel.post.page;
                    delete contentModel.post.user;

                    result.contents.push(contentModel);
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

    private parseUserField(user: any): any {
        const userResult: any = {};

        if (user !== undefined) {
            userResult.id = user.id;
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