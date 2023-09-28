import request from 'supertest'

describe('Main Api', () => {
    it('Should return a 200 status code', async done => {
        request('http://localhost:9000/api')
            .get('/')
            .expect(200)
            .end((err, res) => {
                if (err) return done(err)
                expect(res.body).toMatchObject({ 'name': 'SpanboonRESTFULAPI' })
                done()
            });
    });
});

describe('Main hot update Snapshot', () => {
    it('Should return a 400 status code if objIds does not exists in the database.', async () => {
        const requestBody = {
            'newsObj': '6515085df542d8dbd70defba',
        };
        const response = await request('http://localhost:9000/api').post('/main/hot').send(requestBody);
        expect(response.statusCode).toBe(400);
    });

    it('Should return a 400 status code if objIds empty.', async () => {
        const requestBody = {
            'newsObj': ''
        };
        const response = await request('http://localhost:9000/api').post('/main/hot').send(requestBody);
        expect(response.statusCode).toBe(404);
    })

    it('Should return a 200 status code if everything just fine.', async () =>{
        const requestBody = {
            'newsObj': '6515085df542d8dbd70defb0',
        };
        const response = await request('http://localhost:9000/api').post('/main/hot').send(requestBody);
        expect(response.statusCode).toBe(200);
    })
});