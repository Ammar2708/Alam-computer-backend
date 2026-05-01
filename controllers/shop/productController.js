import Product from "../../models/Product.js";

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getFilterProducts = async (req, res) => {
  try {
    const {
      category = [],
      brand = [],
      search = "",
      sortBy = "price-lowtohigh",
    } = req.query;
    let filters = {};

    if (category.length) {
      filters.category = { $in: category.split(",") };
    }

    if (brand.length) {
      filters.brand = { $in: brand.split(",") };
    }

    const searchTerm = search.trim();

    if (searchTerm) {
      const searchRegex = new RegExp(escapeRegex(searchTerm), "i");
      filters.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
        { brand: searchRegex },
      ];
    }

    let sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price=1
        break;
      case "price-hightolow":
        sort.price=-1
        break;
      case "title-atoz":
        sort.title=1
        break;
      case "title-ztoa":
        sort.title=-1
        break;
      default:
        sort.price=1
        break;
    }
    const products = await Product.find(filters).sort(sort);
    res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getProductDetails=async(req,res)=>{
  try{
    const product=await Product.findById(req.params.id)
    if(!product){
      return res.status(404).json({
        success:false,
        message:"Product not found"
      })
    }
    res.status(200).json({
      success:true,
      data:product
    })
  }
  catch(error){
    console.log(error)
    res.status(500).json({
      success:false,
      message:error.message})
    
  }
}

export {getFilterProducts,getProductDetails}
