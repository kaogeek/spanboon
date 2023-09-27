import supertest from 'supertest';
import createServer from '../../../../src/utils/server';

const app = createServer();

describe('ObjectiveController', () => {
    describe('given the objective does not exist', () => {
        it('should return a 404 status code', async () => {
            const objectiveId = 'objective-1234';
            await supertest(app).get(`/api/objective/${objectiveId}`).expect(404);
            
        });
    });
});
