import mongoose, { Schema } from 'mongoose';

const notificationSchema = new Schema({
  recipientId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: 'recipientType', // dynamic reference
  },
  recipientType: {
    type: String,
    enum: ['User', 'Ambulance', 'Admin'],
    required: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
