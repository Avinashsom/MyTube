import mongoose,{Schema} from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const commentSchema = new Schema(
    {
       content: {
        type: "String",
        required: true,
       },
       video: {
        type: Schema.Types.ObjectId,
        ref: "Video"
       },
       owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
       } 
    },
    {
        timestamps: true
    }
)

//what do aggregat pagginate? 
//answer -- it helps us to write pagination query in aggregate query, 
// we can write pagination query in normal query but not in aggregate query, 
// so we use this plugin to write pagination query in aggregate query 
commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)