import request from 'supertest'

describe('ObjectiveController', () => {
    describe('given the objective does not exist', () => {
        it('should return a 400 status code', async () => {
            const objectiveId = 'objective-1234';
            await request('http://localhost:9000/api').get(`/objective/${objectiveId}`).expect(400);

        });
    });
});
