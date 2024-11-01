const userSchema = new Schema({
    // ... existing fields ...
    resetToken: String,
    resetTokenExpiry: Date
}); 