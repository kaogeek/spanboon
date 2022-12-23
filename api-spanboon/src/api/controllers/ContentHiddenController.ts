import { JsonController } from 'routing-controllers';
import { ContentHiddenService } from '../services/ContentHiddenService';

@JsonController('/content')
export class ContentHiddenController {

    constructor(private contentHiddenService: ContentHiddenService) {

    }
}