import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../../lib/prisma/prisma.service";
import { PayloadUser } from "../../../lib/types";
import { JwtService } from "@nestjs/jwt";
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";


@WebSocketGateway({
    cors: {
        origin: process.env.CORE_ORIGIN, // Izinkan sementara untuk testing agar tidak kena CORS error
        credentials: true,
    },
})
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private jwtService: JwtService,
        private prisma: PrismaService,
        private configService: ConfigService
    ) { }

    async handleConnection(client: Socket) {
        try {
            const rawToken = client.handshake.auth?.token || client.handshake.headers?.authorization;
            if (!rawToken) {
                console.log('Koneksi ditolak: Token tidak ditemukan');
                client.disconnect(true);
                return;
            }

            const token = rawToken.startsWith('Bearer ') ? rawToken.split(' ')[1] : rawToken;
            const payload: PayloadUser = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('SECRET_ACCESS_TOKEN'),
            });

            const existingUser = await this.prisma.user.findUnique({
                where: { id: payload.id },
                select: { id: true }, // Ambil field seperlunya saja agar query cepat
            });

            if (!existingUser) {
                console.log('Koneksi ditolak: User tidak ditemukan atau terblokir');
                client.disconnect(true);
                return;
            }

            client.data.user = { ...payload };
            client.join(`user:${existingUser.id}`);
            console.log(`Client terverifikasi: ${client.id}`);
            client.emit("welcome", { message: "Hai selamat datang di websocket me." });
        } catch (e) {
            console.log('Koneksi ditolak: Token tidak valid');
            client.disconnect(); // Putuskan koneksi jika token salah
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    handleUpdateIntegration(userId: string, { instanceName, status }) {
        const targetRoom = `user:${userId}`;

        // Ambil daftar socket active di room ini
        const activeSockets = this.server.sockets.adapter.rooms.get(targetRoom);
        const count = activeSockets ? activeSockets.size : 0;

        console.log(`📡 [DEBUG] Mengirim ke ${targetRoom} | Jumlah Client Active: ${count}`);

        this.server.to(targetRoom).emit("integration.update", { instanceName, status });
    }

}