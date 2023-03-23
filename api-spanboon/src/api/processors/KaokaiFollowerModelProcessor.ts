import { AbstractSeparateSectionProcessor } from './AbstractSeparateSectionProcessor';
import { SectionModel } from '../models/SectionModel';
import { PostsService } from '../services/PostsService';
import { S3Service } from '../services/S3Service';
import { UserLikeService } from '../services/UserLikeService';
import { UserLike } from '../models/UserLike';
import { LIKE_TYPE } from '../../constants/LikeType';
import { ObjectID } from 'mongodb';
import { UserFollowService } from '../services/UserFollowService';
export class KaokaiFollowerModelProcessor extends AbstractSeparateSectionProcessor {
    constructor(
        private postsService: PostsService,
        private s3Service: S3Service,
        private userLikeService: UserLikeService,
        private userFollowService: UserFollowService,
    ) {
        super();
    }

    public process(): Promise<SectionModel> {
        return new Promise(async (resolve, reject) => {
            try {
                // get config

                let limit: number = undefined;
                if (this.config !== undefined && this.config !== null) {
                    if (typeof this.config.limit === 'number') {
                        limit = this.config.limit;
                    }

                }

                let userId = undefined;
                // get startDateTime, endDateTime
                if (this.data !== undefined && this.data !== null) {
                    limit = this.data.limit;
                    userId = this.data.userId;

                }
                const pageContent = [];
                const userContent = [];
                const follower = await this.userFollowService.find({userId:new ObjectID(userId)});
                if(follower.length >0){
                    for(const follow of follower){
                        if(follow.subjectType === 'PAGE'){
                            pageContent.push(new ObjectID(follow.subjectId));
                        }else{
                            userContent.push(new ObjectID(follow.subjectId));
                        }
                    }
                }else{
                    resolve(undefined);
                }
                const postStmd = await this.postsService.aggregate(
                    [
                        {$match:{ isDraft: false, deleted: false, hidden: false,pageId:{$in:pageContent},ownerUser:{$in:userContent}}},
                        {$sort:{createdDate:-1}},
                        {$limit:limit},
                    ]
                );
                const lastestDate = null;
                const result: SectionModel = new SectionModel();
                result.title = (this.config === undefined || this.config.title === undefined) ? 'ข่าวสารก่อนหน้านี้':'ข่าวสารก่อนหน้านี้';
                result.subtitle = '';
                result.description = '';
                result.iconUrl = '';
                result.contents = [];
                result.type = this.getType(); // set type by processor type

                for (const row of postStmd) {
                    const user = (row.user !== undefined && row.user.length > 0) ? row.user[0] : undefined;
                    const firstImage = (row.gallery.length > 0) ? row.gallery[0] : undefined;

                    const contents: any = {};
                    contents.coverPageUrl = (row.gallery.length > 0) ? row.gallery[0].imageURL : undefined;
                    if (firstImage !== undefined && firstImage.s3FilePath !== undefined && firstImage.s3FilePath !== '') {
                        try {
                            const signUrl = await this.s3Service.getConfigedSignedUrl(firstImage.s3FilePath);
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