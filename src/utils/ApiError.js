// modified the eror comes in a formatted structure 
class ApiError extends Error{
    constructor(
        statusCode,
        message= "Something went wrong",
        errors= [],
        stack= ""
    ){
        super(message)
        this.message= message
        this.statusCode= statusCode
        this.data= null
        this.success= false
        this.errors = errors

        if(stack){
            this.stack=stack
        }else{
            Error.capturedStackTrace(this, this.constructor)
        }
    }
}
export {ApiError}