const asyncHandler = (requestHandler) => {
   (req,res,next) => {
      Promise.resolve(requestHandler(req,res,next)).catch((err)=>{ next(err)})
    }
}
// cerate a wrapper for function of async await we use lot of place upper one is promise handler

export {asyncHandler}




//this is wrraper of try catch &&& they are 2 approach both use in production

/*
const asyncHandler = (requestHandler) => async (req.res.next) => {
    try{
      await requestHandler(req,res,next)
      }catch(error){
          res.send(err.code || 500).json({
              success: false,
              message: err.messsage
            })
        }
    }
*/