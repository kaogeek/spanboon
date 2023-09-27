import express from 'express';

function createServer():any {
    const app = express();
    app.use(express.json());
    return app;
}

export default createServer;