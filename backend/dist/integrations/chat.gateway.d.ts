import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    server: Server;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinConversation(client: Socket, conversationId: string): void;
    handleLeaveConversation(client: Socket, conversationId: string): void;
    notifyNewMessage(message: any): void;
}
