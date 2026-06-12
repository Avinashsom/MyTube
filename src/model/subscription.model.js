import mongoose,{Schema} from "mongoose";

const subscriptionSchema = new Schema(
    {
        subscriber:{
            type: Schema.Types.ObjectId,
            ref: "User" //who subcribed
        },
        channel:{
            type: Schema.Types.ObjectId,
            ref: "User" //whom 'subscriber' subscribed(channel)
        }
    },
    {
        timestamps: true
    }
)

export const Subscriber = mongoose.model("Subscriber", subscriptionSchema)