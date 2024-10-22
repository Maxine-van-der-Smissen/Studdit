const mongoose = require('mongoose');

const app = require('./app');

app.on('databaseConnected', function () {
    const port = 3050

    app.listen(port, () => {
        console.log(`server is listening on port ${port}`)
    });
});

mongoose.connect('mongodb+srv://test:test123@cluster0-ptq4v.mongodb.net/test?retryWrites=true&w=1', {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
    .then(() => {
        console.log('MongoDB connection established');

        app.emit('databaseConnected');
    })
    .catch(err => {
        console.log('MongoDB connection failed')
        console.log(err)
    });