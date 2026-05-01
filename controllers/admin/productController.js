
import Product from "../../models/Product.js";
import { imageUploadUtil } from "../../helpers/cloudinary.js";

const normalizeProductImages = (image, images = []) => {
  const normalizedImages = Array.isArray(images)
    ? images
    : typeof images === "string"
    ? [images]
    : [];

  return Array.from(new Set([image, ...normalizedImages].filter(Boolean)));
};

const handleImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required",
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const url = "data:" + req.file.mimetype + ";base64," + b64;
    const result = await imageUploadUtil(url);

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Image upload failed", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Image upload failed",
    });
  }
};


//add new product
const addProduct=async(req,res)=>{
 


  try{
     const {
    title,
    description,
    category, 
    brand,
    price,
    salePrice,
    totalStock,
    averageReview,
    image,
    images
  }=req.body

  const productImages = normalizeProductImages(image, images);

  const newlyCreatedProdut=new Product({
    title,
    description,
    category, 
    brand,
    price,
    salePrice,
    totalStock,
    averageReview,
    image: productImages[0],
    images: productImages
  })  

  await newlyCreatedProdut.save()
  res.status(201).json({
    success:true,
    message:"Product created successfully",
    data:newlyCreatedProdut
  })


  }
  catch(error){
    console.log(error)
    res.status(500).json({
      success:false,
      message:error.message})
    
  }
}


//get all products
const fetchAllProducts=async(req,res)=>{
  try{
    const listOfProducts=await Product.find()
    res.status(200).json({
      success:true,
      data:listOfProducts
    })
  }
  catch(error){
    console.log(error)
    res.status(500).json({
      success:false,
      message:error.message})
    
  }



 
}
 //edit product
const editProduct=async(req,res)=>{
  try{
    const {
    title,
    description,
    category, 
    brand,
    price,
    salePrice,
    totalStock,
    averageReview,
    image,
    images
    }=req.body

    const productImages = normalizeProductImages(image, images);
    const updatePayload = {
      ...req.body,
      image: productImages[0],
      images: productImages,
    };

    const updatedProduct=await Product.findByIdAndUpdate(req.params.id,updatePayload,{new:true})
    if(!updatedProduct){
      return res.status(404).json({
        success:false,
        message:"Product not found"
      })
    }
    res.status(200).json({
      success:true,
      message:"Product updated successfully",
      data:updatedProduct
    })


  }
  catch(error){
    console.log(error)
    res.status(500).json({
      success:false,
      message:error.message})
    
  }
}

//DELETE product
const deleteProduct=async(req,res)=>{
  try{
    const deletedProduct=await Product.findByIdAndDelete(req.params.id)
    if(!deletedProduct){
      return res.status(404).json({
        success:false,
        message:"Product not found"
      })
    }
    res.status(200).json({
      success:true,
      message:"Product deleted successfully",
      data:deletedProduct
    })
  }
  catch(error){
    console.log(error)
    res.status(500).json({
      success:false,
      message:error.message})
    
  }
}



export {handleImageUpload,addProduct,fetchAllProducts,editProduct,deleteProduct}
