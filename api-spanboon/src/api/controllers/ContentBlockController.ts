import { JsonController } from 'routing-controllers';
import { ContentBlockService } from '../services/ContentBlockService';

@JsonController('/content')
export class ContentBlockController {

    constructor(private contentBlockService: ContentBlockService) {

    }
}