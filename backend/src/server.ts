import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

wss.on('connection', (ws)=>{
    console.log('Client connected');
    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        wss.clients.forEach((client)=>{
            if(client!==ws && client.readyState === 1){
                client.send(JSON.stringify(data));
            }
        })

    })
    ws.on('close', () => {
        console.log('Client disconnected');
    });
})
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});