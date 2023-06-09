const productCollection = require('../model/productSchema')
const orderCollection = require('../model/orderSchema')
const reviewCollection = require('../model/reviewSchema')


const globalFunction = require('../global/global-functions')


const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

module.exports = {
  getPostReview: async (req, res, next) => {
    try {
      const productId = req.params.id
      const user = req.session.user
      const userId = user._id
      const count = await globalFunction.cartCount(userId)
      const odrPrduct = await orderCollection.aggregate([
        {
          $match: {
            userId: new ObjectId(userId)
          }
        },
        {
          $unwind: '$products'
        },
        {
          $project: {
            item: '$products.item'
          }
        },
        {
          $match: {
            item: new ObjectId(productId)
          }
        }
      ]).toArray()

      if (odrPrduct.length != 0) {
        req.session.order = true
      } else {
        req.session.order = null
      }

      const odr = req.session.order

      const product = await productCollection.findOne({ _id: new ObjectId(productId) })
      res.render('users/reviews-form', { User: true, user, product, count, odr })
    } catch (err) {
      next(err)
    }
  },

  getAllReviews:async(req,res,next)=>{
    try{
      const productId = req.params.id
      const product = await productCollection.findOne({_id:new ObjectId(productId)})
      const reviews = await reviewCollection.aggregate([
        {
          $match: {
            productId: new ObjectId(productId)
          },
        },
        {
          $unwind: '$review'
        }
      ]).toArray()
      if(req.session.user){
        const user = req.session.user
        const userId = user._id
        const count = await globalFunction.cartCount(userId)
        res.render('users/all-reviews',{User:true,user,count,reviews,product})
      }else{
        res.render('users/all-reviews',{reviews,product})
      }
    }catch(err){
      next(err)
    }
  },

  submitReview:async(req,res,next)=>{
    try{
      const user = req.session.user
      const productId = req.params.id
      if(req.body.reviewValid == '1'){
        req.session.reviewObj={
          rating  : 1,
          description  : req.body.description,
          userName  : user.userName
        }
      }else if(req.body.reviewValid == '2'){
        req.session.reviewObj={
          rating  : 2,
          description  : req.body.description,
          userName  : user.userName
        }
      }else if(req.body.reviewValid == '3'){
        req.session.reviewObj={
          rating  : 3,
          description  : req.body.description,
          userName  : user.userName
        }
      }else if(req.body.reviewValid == '4'){
        req.session.reviewObj={
          rating  : 4,
          description  : req.body.description,
          userName  : user.userName
        }
      }else if(req.body.reviewValid == '5'){
        req.session.reviewObj={
          rating  : 5,
          description  : req.body.description,
          userName  : user.userName
        }
      }
      const reviewObj = req.session.reviewObj

      const review = await reviewCollection.findOne({productId:new ObjectId(productId)})
      if(review){
        reviewCollection.updateOne({productId:new ObjectId(productId)},{$push:{review:reviewObj}}).then()
      }else{
        const Obj ={
          productId:new ObjectId(productId),
          review:[reviewObj]
        }
        reviewCollection.insertOne(Obj).then()
      }

      const overall = await reviewCollection.aggregate([
        {
          $match: {
            productId: new ObjectId(productId)
          },
        },
        {
          $unwind: '$review'
        },
        {
          $group: {
            _id: null, overall: {
              $avg: '$review.rating'
            }
          }
        }
      ]).toArray()

      if(overall===null||overall.length===0){
        req.session.newRating = reviewObj.rating
      }else{
        req.session.newRating = overall[0].overall
      }
      const rating = req.session.newRating
      productCollection.updateOne({_id:new ObjectId(productId)},{$set:{rating:rating}}).then()

      setTimeout(() => {
        res.redirect('/product-details/'+productId)
      }, 1000);
    }
    catch(err){
      next(err)
    }
  }
}