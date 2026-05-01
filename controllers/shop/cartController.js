import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";

const formatCartItems = (items = []) =>
    items
        .filter((item) => item.productId)
        .map((item) => ({
            productId: item.productId?._id || item.productId,
            quantity: item.quantity,
            title: item.popupTitle || item.productId?.title,
            description: item.popupDescription || item.productId?.description,
            image: item.popupImage || item.productId?.image,
            price: item.productId?.price,
            salePrice: item.productId?.salePrice,
            usesPopupContent: Boolean(
                item.popupTitle || item.popupDescription || item.popupImage
            ),
        }));

const getProductIdString = (productId) =>
    productId?._id ? productId._id.toString() : productId?.toString();

const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity, popupSnapshot } = req.body
    
    //initail state
    if (!userId || !productId || !quantity) {
        return res.status(400).json({
            eror: "Missing required fields"
        })
    }

    //check if product exists
    const product = await Product.findById(productId)
    if (!product) {
        return res.status(404).json({
            error: "Product not found"
        })
    }

    //check if cart exists
    let cart = await Cart.findOne({ userId })
    if (!cart) {
        cart = new Cart({ userId, items: [] })
    }
    const findCurrentProductIndex = cart.items.findIndex((item ) => getProductIdString(item.productId) === productId,
);

if (findCurrentProductIndex > -1) {
    cart.items[findCurrentProductIndex].quantity += quantity;

    if (popupSnapshot) {
        cart.items[findCurrentProductIndex].popupTitle =
            popupSnapshot.title || cart.items[findCurrentProductIndex].popupTitle;
        cart.items[findCurrentProductIndex].popupDescription =
            popupSnapshot.description ||
            cart.items[findCurrentProductIndex].popupDescription;
        cart.items[findCurrentProductIndex].popupImage =
            popupSnapshot.imageUrl || cart.items[findCurrentProductIndex].popupImage;
    }
} else {
    cart.items.push({
        productId,
        quantity,
        popupTitle: popupSnapshot?.title || "",
        popupDescription: popupSnapshot?.description || "",
        popupImage: popupSnapshot?.imageUrl || "",
    });
}

await cart.save();
return res.status(200).json({
    success: true,
    message: "Product added to cart successfully"});
} catch (error) {
    res.status(500).json({
        message: "Error adding product to cart",
        error: "Faild to add product to cart",
    })
}
};



const fetchCartItems = async (req, res) => {
    try {
        const { userId } = req.params;
        if(!userId) {
            return res.status(400).json({
                error: "Missing userId"
            })
        }

        const cart = await Cart.findOne({ userId }).populate({
            path: "items.productId",
            select: "image title description price salePrice"});

        if (!cart) {
            return res.status(200).json({
                success: true,
                message: "Cart is empty",
                data: {
                    items: [],
                },
            });
        }
        const validateItems = cart.items.filter((productItem) => productItem.productId)
        if (validateItems.length < cart.items.length) {
            cart.items = validateItems;
            await cart.save();
        }
        
        const populateCartItems = validateItems.map((item) => ({
            productId: item.productId._id,
            quantity: item.quantity,
            title: item.popupTitle || item.productId.title,
            description: item.popupDescription || item.productId.description,
            image: item.popupImage || item.productId.image,
            price: item.productId.price,
            salePrice: item.productId.salePrice,
            usesPopupContent: Boolean(
                item.popupTitle || item.popupDescription || item.popupImage
            ),
        }));
        res.status(200).json({
            success: true,
            message: "Cart items fetched successfully",
            data: {
                ...cart._doc,
                items: populateCartItems,
            }
        });

    } catch (error) {
        res.status(500).json({
            message: "Error fetching cart items",
            error: "Failed to fetch cart items",
        });
    }
}


const updateCartItemQty = async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        if (!userId || !productId || quantity === undefined || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
            
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const currentProductIndex = cart.items.findIndex((item) => getProductIdString(item.productId) === productId);
        if (currentProductIndex === -1) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        cart.items[currentProductIndex].quantity = quantity;
        await cart.save();
        await cart.populate({
            path: "items.productId",
            select: "image title description price salePrice",
        });
        
        return res.status(200).json({
            success: true,
            message: "Cart item quantity updated successfully",
            data: {
                ...cart._doc,
                items: formatCartItems(cart.items),
            },
        })

    } catch (error) {
        res.status(500).json({
            message: "Error updating cart item quantity",
            error: "Failed to update cart item quantity",
        });
    }
}



const deleteCartItem = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        if (!userId || !productId) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields",
            });
        }

        const cart = await Cart.findOne({ userId }).populate({
            path: "items.productId",
            select: "image title description price salePrice",

        });

        if (!cart) {
            return res.status(404).json({
                success: false,
                message: "Cart not found",
            });
        }

        const initialLength = cart.items.length

        cart.items = cart.items.filter((item) => getProductIdString(item.productId) !== productId);

        if (cart.items.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: "Product not found in cart",
            });
        }

        await cart.save();

        await cart.populate({
            path: "items.productId",
            select: "image title description price salePrice",
        });

        return res.status(200).json({
            success: true,
            message: "Cart item deleted successfully",
            data: {
                ...cart._doc,
                items: formatCartItems(cart.items),
            },
        });

    } catch (error) {
        res.status(500).json({
            message: "Error deleting cart item",
            error: "Failed to delete cart item",
        });
    }
}


export { addToCart, fetchCartItems, updateCartItemQty, deleteCartItem };
        

