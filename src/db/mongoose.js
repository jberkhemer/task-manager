const mongoose = require('mongoose')

const connectionURL = process.env.MONGOOSE_URL

mongoose.connect((connectionURL),{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).catch((err)=>{
    console.log('Error connecting!',err)
})