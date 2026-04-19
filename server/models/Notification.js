const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  type: { type: String, enum: ['alert', 'info', 'reminder'], default: 'info' },
  recipient: { type: String, required: true }, // Can be 'all', 'batch_<batchId>', or specific User ID
  sender: { type: mongoose.Schema.Types.ObjectId, required: true },
  dismissedBy: [{ type: mongoose.Schema.Types.ObjectId }]
}, { timestamps: true });

notificationSchema.post('save', function(doc) {
    const { emitToUser, emitToRole, emitToAll } = require('../utils/socket');
    
    // Don't broadcast on updates (like dismissals), only on new creations.
    // mongoose post 'save' triggers on both create and save(update).
    // An easy way to check if it's new is whether createdAt matches updatedAt roughly, 
    // but Mongoose has a better way: checking doc.$isNew before save, or just use the fact 
    // that we usually use findByIdAndUpdate for dismissals. 
    // Actually, Notification.create triggers this. dismissNotification uses findByIdAndUpdate which DOES NOT trigger post('save').
    
    const notification = doc.toObject();

    if (doc.recipient === 'all') {
        emitToAll('new_notification', notification);
        emitToAll('badge_refresh', {});
    } else if (doc.recipient === 'all_admins') {
        emitToRole('admin', 'new_notification', notification);
        emitToRole('admin', 'badge_refresh', {});
    } else {
        emitToUser(doc.recipient.toString(), 'new_notification', notification);
        emitToUser(doc.recipient.toString(), 'badge_refresh', {});
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
