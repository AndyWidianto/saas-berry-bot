import { PrismaService } from "../../../lib/prisma/prisma.service";
import { PayloadUser } from "../../../lib/types";
import { JwtService } from "@nestjs/jwt";
import { MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";


@WebSocketGateway({
    cors: {
        origin: '*', // Izinkan sementara untuk testing agar tidak kena CORS error
        credentials: true,
    },
})
export class EventGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(private jwtService: JwtService, private prisma: PrismaService) {}

    async handleConnection(client: Socket) {
        try {
            const authHeader = client.handshake.auth.token;
            const token = authHeader.split(' ')[1];
            const payload: PayloadUser = await this.jwtService.verifyAsync(token);
            client.data.user = payload;

            const existing = await this.prisma.user.findUnique({
                where: { id: payload.id }
            });
            if (!existing) {
                console.log('Koneksi ditolak: Token tidak valid');
                client.disconnect();
            }

            console.log(`Client terverifikasi: ${client.id}`);
        } catch (e) {
            console.log('Koneksi ditolak: Token tidak valid');
            client.disconnect(); // Putuskan koneksi jika token salah
        }
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage("send_message")
    handleMessage(@MessageBody() body: { content: string; number: string }) {
        console.log('Pesan diterima:', body);

        // Kirim balik ke client sebagai konfirmasi (optional)
        this.server.emit("message_received", { status: "success", data: body });
    }

}