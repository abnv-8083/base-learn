const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: [
                process.env.CLIENT_URL || 'https://baselearn.in',
                'http://localhost:3000',
                'http://localhost:5173'
            ],
            methods: ['GET', 'POST'],
            credentials: true
        }
    });

    io.on('connection', (socket) => {
        console.log(`[SOCKET] User connected: ${socket.id}`);

        // Join role-based or user-based rooms
        socket.on('join', (userId) => {
            if (userId) {
                socket.join(userId);
                console.log(`[SOCKET] User ${userId} joined room`);
            }
        });

        socket.on('join_role', (role) => {
            if (role) {
                socket.join(`role_${role}`);
                console.log(`[SOCKET] User joined role room: role_${role}`);
            }
        });

        socket.on('disconnect', () => {
            console.log(`[SOCKET] User disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Helper to emit events to specific recipients
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(userId).emit(event, data);
    }
};

const emitToRole = (role, event, data) => {
    if (io) {
        io.to(`role_${role}`).emit(event, data);
    }
};

const emitToAll = (event, data) => {
    if (io) {
        io.emit(event, data);
    }
};

module.exports = {
    initSocket,
    getIO,
    emitToUser,
    emitToRole,
    emitToAll
};
