import express from "express";
const router = express.Router();
import { handleImageUpload,
    addProduct,
    fetchAllProducts,
    editProduct,
    deleteProduct

 } from "../../../controllers/admin/productController.js";
import { upload } from "../../../helpers/cloudinary.js";


router.post("/upload-image", upload.single("image"), handleImageUpload);
router.post("/add", addProduct);
router.get("/all", fetchAllProducts);
router.put("/edit/:id", editProduct);
router.delete("/delete/:id", deleteProduct); 
export default router