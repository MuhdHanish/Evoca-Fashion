const mongoose = require('mongoose')

const orderSchema = mongoose.Schema({
 deliveryDetails:{
  type:Object,
  required:true
 },
 userId:{
  type:String,
  required:true
 },
 products:{
  type:Array,
  required:true
 },
 amount:{
  type:Number,
  required:true
 },
 payment:{
  type:String,
  required:true
 },
 status:{
  type:String,
  required:true
 },
 date:{
  type:Date,
  required:true
 },
 month:{
  type:Number,
  required:true
 },
 orderStatus:{
  type:String,
  required:true
 },
 reason:{
  type:String,
  required:true
 },
 disAgreed:{
  type:Boolean,
  required:true
 }
})

const orderCollection = mongoose.model("Order",orderSchema).collection

module.exports = orderCollection