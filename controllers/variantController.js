import { ProductVariant, ProductColor, Product, Image } from "../config/db.js";
import { Op } from "sequelize";
import { uploadToImgBB } from "../utils/uploadToImgBB.js";

// Admin: Get all variants (optional filter by product)
export const getAllVariants = async (req, res) => {
  try {
    const { product_id } = req.query;
    const whereClause = product_id ? { product_id } : {};

    const variants = await ProductVariant.findAll({
      where: whereClause,
      include: [
        { model: Product, attributes: ["name"] },
        {
          model: ProductColor,
          attributes: ["color_name", "color_code"],
          include: [
            {
              model: Image,
              where: { related_type: "productColor" },
              required: false,
              attributes: ["image_url", "alt_text"],
            },
          ],
        },
      ],
    });

    res.json(variants);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch variants", error: err.message });
  }
};

// Admin: Update specific variant
export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await ProductVariant.update(req.body, { where: { id } });

    if (updated === 0)
      return res
        .status(404)
        .json({ message: "Variant not found or no changes made" });

    res.json({ message: "Variant updated" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update variant", error: err.message });
  }
};

// Admin: Delete specific variant
export const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    await ProductVariant.destroy({ where: { id } });
    res.json({ message: "Variant deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete variant", error: err.message });
  }
};

// Admin: Create a variant
export const createVariant = async ( req, res ) =>
{
  try
  {
    const {
      product_name,
      variant_name,
      variant_value,
      product_color_name,
      stock,
      additional_price,
    } = req.body;

    if ( !product_name || !variant_name || !variant_value )
    {
      return res.status( 400 ).json( { message: "Missing required fields" } );
    }

    // Find product by name
    const product = await Product.findOne( { where: { name: product_name } } );
    if ( !product )
    {
      return res.status( 404 ).json( { message: "Product not found" } );
    }

    let product_color_id = null;
    if ( product_color_name )
    {
      const color = await ProductColor.findOne( {
        where: { color_name: product_color_name, product_id: product.id },
      } );
      if ( !color )
      {
        return res
          .status( 404 )
          .json( { message: "Color not found for this product" } );
      }
      product_color_id = color.id;
    }

    const newVariant = await ProductVariant.create( {
      product_id: product.id,
      variant_name,
      variant_value,
      product_color_id,
      stock: parseInt( stock ) || 0,
      additional_price: parseFloat( additional_price ) || 0,
    } );

    // Handle image uploads via req.files
    if ( req.files && req.files.length > 0 )
    {
      const imagePromises = req.files.map( async ( file ) =>
      {
        const imageUrl = await uploadToImgBB( file.path );
        return Image.create( {
          image_url: imageUrl,
          alt_text: "",
          related_type: "productVariant",
          related_id: newVariant.id,
        } );
      } );
      await Promise.all( imagePromises );
    }

    // Fetch the variant with associated images
    const variantWithImages = await ProductVariant.findOne( {
      where: { id: newVariant.id },
      include: [
        {
          model: Image,
          where: { related_type: "productVariant" },
          required: false,
          attributes: [ "image_url", "alt_text" ],
        },
      ],
    } );

    res.status( 201 ).json( {
      message: "Variant created successfully",
      variant: variantWithImages,
    } );
  } catch ( err )
  {
    res
      .status( 500 )
      .json( { message: "Failed to create variant", error: err.message } );
  }
};