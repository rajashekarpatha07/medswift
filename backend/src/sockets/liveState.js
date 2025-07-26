// This file holds the shared, in-memory state for our socket connections.
// By centralizing it here, all handlers can import and use the same data maps.

export const onlineUsers = new Map();
export const onlineAmbulances = new Map();
