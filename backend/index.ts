import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'

const app=express();
dotenv.config({
    path: './.env'
})
app.use(express.json());
app.use(express.urlencoded({ extended: true })); 
app.use(cors());

app.get('/',(req,res)=>{
    res.send("Your backend server has started")
})

const port=process.env.PORT|| 3000;
   app.listen(port,()=>{
    console.log(`Your server is listening on PORT ${port}`)

   })


   import explainRoute from './src/router/explain.route.js';
   import formatRoute from './src/router/format.route.js';
    import validateApiRoute from './src/router/validateApi.route.js';
    import questionRoute from './src/router/question.route.js';
   
   

   app.use('/api/v1',explainRoute)
   app.use('/api/v1',formatRoute)
    app.use('/api/v1',validateApiRoute)
    app.use('/api/v1',questionRoute)


