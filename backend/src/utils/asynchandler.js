//wraper function 

const asyncHandler =  (requestHandle)=>{
    (req,res,next)=>{
        Promise
        .resolve(requestHandle(req, res, next))
        .catch((error)=>next(error));
    }


}

export {asyncHandler}