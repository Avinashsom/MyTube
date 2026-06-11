import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;
        //upload file on cloudinaary
        const uploadFile = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file succes uploaded
        console.log("file is succesfully uploaded" , uploadFile.url);
        
    } catch (error) {
        fs.unlinkSync(localFilePath) //remove the locally temporary saved file as upload failed.
        return null
    }
}
export {uploadOnCloudinary}