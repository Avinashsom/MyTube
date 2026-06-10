import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname) // In production we save the filename+uniquesuffix, 
    // originalname is overwrite same file, but here server is save file 
    // very minimal time it transfer on cloudiary.
  }
})

export const upload = multer({ storage: storage }) //we also write same thing single like {storage} because es6.