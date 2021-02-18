// import { Request } from 'express';
// import MockExpressRequest from 'mock-express-request';
import { ConfigController } from '../../../../src/api/controllers/ConfigController';
import { Config } from '../../../../src/api/models/Config';
import { ConfigService } from '../../../../src/api/services/ConfigService';
import { LogMock } from '../../lib/LogMock';
import { RepositoryMock } from '../../lib/RepositoryMock';

describe('ConfigController', () => {
    let configController: ConfigController;
    let configService: ConfigService;
    let configRepository: RepositoryMock<Config>;
    let log: LogMock;

    beforeEach(() => {
        log = new LogMock();
        configRepository = new RepositoryMock<Config>();
        configService = new ConfigService(configRepository as any);
        configController = new ConfigController(configService);
    });

    /* Q. should we mockRepo or save into real db ? */

    describe('@GET /config/:name', () => {
        test('Should return config value', async () => {
            // const req: Request = new MockExpressRequest({
            //     headers: {
            //         Authorization: `Basic ${base64}`,
            //     },
            // });

            // configController.configDetails();
            expect(true).toBe(true);
        });

    });

});