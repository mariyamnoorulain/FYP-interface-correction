const http = require('http');

const run = () => {
    // tutorId for 'ali' from previous debug
    const tutorId = '696163bacc4ae13009a03f26';
    const url = `http://localhost:5000/api/lectures?tutorId=${tutorId}`;

    console.log(`Fetching from: ${url}`);

    http.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Status Code:', res.statusCode);
            console.log('Response Body:');
            console.log(data);
        });

    }).on('error', (err) => {
        console.error('Error:', err.message);
    });
};

run();
