import express from 'express'
import dotenv from 'dotenv'

const app=express();
dotenv.config({
    path: './.env'
})
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 


app.get('/',(req,res)=>{
    res.send("Your backend server has started")
})

const port=process.env.PORT|| 3000;
   app.listen(port,()=>{
    console.log(`Your server is listening on PORT ${port}`)

   })

   //routes import
   import explainRoute from './src/router/explain.route.js';

   app.use('/api/v1',explainRoute)


