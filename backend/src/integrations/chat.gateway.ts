import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
    }

    @SubscribeMessage('join_conversation')
    handleJoinConversation(client: Socket, conversationId: string) {
        client.join(`conv_${conversationId}`);
    }

    @SubscribeMessage('leave_conversation')
    handleLeaveConversation(client: Socket, conversationId: string) {
        client.leave(`conv_${conversationId}`);
    }

    // Helper method to notify clients about new messages
    notifyNewMessage(message: any) {
        // Notify everyone about a new message in their specific conversation
        this.server.to(`conv_${message.conversation_id}`).emit('new_message', message);

        // Also notify global inbox for list updates
        this.server.emit('inbox_update', message);
    }
}
