import { connect } from "mongoose";


export const connectToDb = ()=>{
    try {
    connect("mongodb://localhost:27017/conversify")
    console.log('connected');
    
    } catch (err) {
        console.error(err)
    }
}