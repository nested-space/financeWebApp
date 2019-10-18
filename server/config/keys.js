module.exports = {
    mongoURI: 'mongodb://localhost:27017/finance?authSource=admin',
    mongoOptions: {
        user: "finance",
        pass: "finance",
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
}
