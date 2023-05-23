import { IsEnum, IsNotEmpty } from 'class-validator';
import { CONTENT_TYPE } from '../../../constants/ContentAction';

export class UserBlockContentRequest {

    @IsNotEmpty()
    public subjectId: string;
    @IsNotEmpty()
    @IsEnum(CONTENT_TYPE)
    public subjectType: string;
}