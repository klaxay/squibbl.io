"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ws_1 = require("ws");
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
wss.on('connection', (ws) => {
    console.log('Client connected');
    ws.on('message', (message) => {
        const data = JSON.parse(message.toString());
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === 1) {
                client.send(JSON.stringify(data));
            }
        });
    });
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
