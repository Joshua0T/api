const mongoose = require ('mongoose')

const conectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI,{
            
        });
        console.log ('MongoDb conectado');
    } catch (error){
        console.error('error al conectarse en la base de datos',error.message);
        process.exit(1)
    }
};

module.exports = conectDB