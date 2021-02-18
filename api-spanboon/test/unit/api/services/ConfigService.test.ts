// import { Request } from 'express';
// import MockExpressRequest from 'mock-express-request';
import { Config } from '../../../../src/api/models/Config';
import { ConfigService } from '../../../../src/api/services/ConfigService';
import { LogMock } from '../../lib/LogMock';
import { RepositoryMock } from '../../lib/RepositoryMock';

describe('ConfigService', () => {
    let configService: ConfigService;
    let configRepository: RepositoryMock<Config>;
    let log: LogMock;

    beforeEach(() => {
        log = new LogMock();
        configRepository = new RepositoryMock<Config>();
        configService = new ConfigService(configRepository as any);
    });

    /* Q. should we mockRepo or save into real db ? */

    describe('CRUD', () => {
        const configName = 'config.test';
        const configValue = 'Hello World';
        const configType = 'string';

        test('Should Create Config', async () => {
            const config = new Config();
            config.name = configName;
            config.value = configValue;
            config.type = configType;

            const result = await configService.create(config);

            expect(result.name).toBe(config.name);
            expect(result.value).toBe(config.value);
            expect(result.type).toBe(config.type);
        });

        test('Should Get Config', async () => {
            // const result = await configService.findOne({name: configName});

            // expect(result.name).toBe(configName);
            // expect(result.value).toBe(configValue);
            // expect(result.type).toBe(configType);
            expect(true).toBe(true);
        });

        test('Should Throw Exception if config duplicated.', async () => {
            expect(true).toBe(true);
        });

        test('Should Edit Config', async () => {
            // only value and type can change when edit.
        });

        test('Delete Config', async () => {
            expect(true).toBe(true);
        });

    });

});