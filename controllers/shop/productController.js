import Product from "../../models/Product.js";

const hiddenProductCategories = ["HDD"];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const searchableProductFields = ["title", "description", "category", "brand"];

const buildSearchConditions = (searchTerm) => {
  return searchTerm
    .split(/\s+/)
    .map((term) => term.trim())
    .filter(Boolean)
    .map((term) => {
      const searchRegex = new RegExp(escapeRegex(term), "i");

      return {
        $or: searchableProductFields.map((field) => ({
          [field]: searchRegex,
        })),
      };
    });
};

const getFilterProducts = async (req, res) => {
  try {
    const {
      category = [],
      brand = [],
      search = "",
      sortBy = "price-lowtohigh",
    } = req.query;
    let filters = {
      category: { $nin: hiddenProductCategories },
    };

    if (category.length) {
      const selectedCategories = category
        .split(",")
        .filter(Boolean)
        .filter((item) => !hiddenProductCategories.includes(item));

      filters.category.$in = selectedCategories.map(
        (item) => new RegExp(`^${escapeRegex(item.trim())}$`, "i"),
      );
    }

    if (brand.length) {
      filters.brand = {
        $in: brand
          .split(",")
          .filter(Boolean)
          .map((item) => new RegExp(`^${escapeRegex(item.trim())}$`, "i")),
      };
    }

    const searchTerm = search.trim();

    if (searchTerm) {
      filters.$and = buildSearchConditions(searchTerm);
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
    if(!product || hiddenProductCategories.includes(product.category)){
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
