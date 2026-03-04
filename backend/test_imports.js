console.log("Testing imports...");
try {
    require('./models/Enrollment');
    console.log("✅ models/Enrollment loaded");
} catch (e) { console.error("❌ models/Enrollment failed:", e.message); }

try {
    require('./models/tutorProfile');
    console.log("✅ models/tutorProfile loaded");
} catch (e) { console.error("❌ models/tutorProfile failed:", e.message); }

try {
    require('./models/user');
    console.log("✅ models/user loaded");
} catch (e) { console.error("❌ models/user failed:", e.message); }

try {
    require('./middleware/auth');
    console.log("✅ middleware/auth loaded");
} catch (e) { console.error("❌ middleware/auth failed:", e.message); }

try {
    require('./routes/enrollments');
    console.log("✅ routes/enrollments loaded");
} catch (e) { console.error("❌ routes/enrollments failed:", e.message); }
