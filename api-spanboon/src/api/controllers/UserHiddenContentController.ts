import { JsonController } from 'routing-controllers';
import { UserHiddenContentService } from '../services/UserHiddenContentService';

@JsonController('/user/hide/content')
export class UserHiddenContentController {

    constructor(private userHiddenContentService: UserHiddenContentService) {

    }
}