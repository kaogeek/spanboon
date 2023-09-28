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
        const requestBody = {};
        const response = await request('http://localhost:9000/api').post('/main/hot').send(requestBody);
        expect(response.statusCode).toBe(400);
    })

    it('Should return a 200 status code if everything just fine.', async () => {
        const requestBody = {
            'newsObj': '6515085df542d8dbd70defb0',
        };
        const response = await request('http://localhost:9000/api').post('/main/hot').send(requestBody);
        expect(response.statusCode).toBe(200);
    });
});

describe('Main page home for the mobile', () => {
    it('Should return a 400 status code if the date filter empty.', async () => {
        const requestBody = {
            "whereConditions": {
            }
        };
        request('http://localhost:9000/api')
            .get('/main/content/mobile')
            .send(requestBody)
            .expect(400)
    });

    it('Should return a 200 status code if the date filter is only endDate.', async done => {
        const requestBody = {
            "limit": 10,
            "offset": 0,
            "whereConditions": {
                'endDate': '1695834000000'
            }
        };
        request('http://localhost:9000/api')
            .get('/main/content/mobile')
            .send(requestBody)
            .expect(200)
            .end(function(err,res){
                if(err) return done(err)
                expect(res.body).toMatchObject({'message':'Successfully Main Page Data Mobile'})
                done()
            })
    });
    it('Should return a 200 status code if the date filter are both endDate and startDate.', async done => {
        const requestBody = {
            "limit": 10,
            "offset": 0,
            "whereConditions": {
                'startDate': '1693501200000',
                'endDate': '1695834000000'
            }
        };
        request('http://localhost:9000/api')
            .get('/main/content/mobile')
            .send(requestBody)
            .expect(200)
            .end(function(err,res){
                if(err) return done(err)
                expect(res.body).toMatchObject({'message':'Successfully Main Page Data Mobile'})
                done()
            })
    });
});