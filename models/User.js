const userSchema = new mongoose.Schema({
    // ... existing fields ...
    resetToken: String,
    resetTokenExpiry: Date
}); 