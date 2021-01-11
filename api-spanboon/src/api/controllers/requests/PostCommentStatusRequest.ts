import { IsNotEmpty } from 'class-validator';

export class PostCommentStatusRequest {

    @IsNotEmpty({ message: 'comments is required' })
    public comments: string[];
    public asPage: string;
}