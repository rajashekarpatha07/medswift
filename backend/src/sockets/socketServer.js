const handleSocketConnection = (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("emergency_request", (data) => {
    const { location, name, email, userId, medicalHistory, bloodGroup, phone } = data;

    console.log("🚨 Emergency Request From:", name);
    console.log("📧 Email:", email);
    console.log("📍 Location:", location);
    console.log("📋 Medical History:", medicalHistory);
    console.log("🩸 Blood group:", bloodGroup);
    console.log("📱 Phone:", phone);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
};

export default handleSocketConnection;
