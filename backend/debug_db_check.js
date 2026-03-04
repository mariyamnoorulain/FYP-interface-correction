const mongoose = require('mongoose');
const User = require('./models/user');
const Lecture = require('./models/lecture');
const fs = require('fs');
require('dotenv').config();

const run = async () => {
    const logStream = fs.createWriteStream('output_log.txt', { flags: 'w' });
    const log = (msg) => {
        console.log(msg);
        logStream.write(msg + '\n');
    };

    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/learnhub';
        await mongoose.connect(mongoUri);
        log('Connected to MongoDB');

        // 1. Check Users
        const users = await User.find({ role: 'tutor' });
        log('\n--- Tutors ---');
        users.forEach(u => {
            log(`ID: ${u._id}, Name: ${u.name}, Email: ${u.email}`);
        });

        // 2. Check Lectures
        const lectures = await Lecture.find({});
        log('\n--- Lectures ---');
        log(`Total Lectures: ${lectures.length}`);
        lectures.forEach(l => {
            log(`ID: ${l._id}, Title: ${l.title}, TutorID: ${l.tutorId}, CourseId: ${l.courseId}`);
            if (l.tutorId) {
                log(`   -> TutorId Type: ${typeof l.tutorId} (constructor: ${l.tutorId.constructor.name})`);
            }
        });

    } catch (error) {
        log('Error: ' + error);
    } finally {
        await mongoose.disconnect();
        logStream.end();
    }
};

run();
