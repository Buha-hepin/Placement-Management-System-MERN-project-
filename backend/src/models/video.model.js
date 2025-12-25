import { Mongoose,Schema } from "mongoose"; 
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const videoSchema = new Schema({
    videofile:{
        type: String,
        required: true,

    },
    thubbnail:{
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    descreption: {
        type: String,   
    },
    duration: {
        type:Number,
        required: true,
    },
    views: {
        type: Number,
        default: 0,
    },
    ispublished: {
        type: Boolean,      
        default: false,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,     
    }
},
{
    timestamps: true
})
 videoSchema.plugin(mongooseAggregatePaginate);

export const Video = Mongoose.model("Video", videoSchema);