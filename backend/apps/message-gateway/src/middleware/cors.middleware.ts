import { Injectable, NestMiddleware } from "@nestjs/common";


@Injectable()
export class CorsBypassMiddleware implements NestMiddleware {
    use(req: any, res: any, next: (error?: any) => void) {
        if (req.path.startsWith('/api/chatbot')) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
            if (req.method === 'OPTIONS') {
                return res.sendStatus(200);
            }
        }
        next();
    }
}