
import prisma from "../lib/prisma.js";

let idProducts = 1;
const products = [
    {
        id: idProducts++,
        picture: null,
        name: "nasgor",
        price: 20000
    }, 
    {
        id: idProducts++,
        picture: null,
        name: "mie",
        price: 1000
    }
];

// get all
async function getAllProducts(name = '') {
    const results = await prisma.product.findMany({
        where: {
            name: {
                contains: name,
            }
        }
    });
    return results;
}

// get by id
async function getProductById(id) {
    const result = await prisma.product.findUnique({
        where: { 
            id: id 
        }
    });
    return result;
}

// create
async function createProduct(name, price, desc, stock, categoryId, image = null) {
    const newProduct = await prisma.product.create({
        data: {
        name,
        price,
        desc,
        stock,
        categoryId,
        image
        }
    });
    return newProduct;
}


// update
async function updateProduct(id, name, price, image = null) {
    try {
        const newData = {};
        if (name !== undefined) newData.name = name;
        if (price !== undefined) newData.price = price;
        if (image !== undefined) newData.image = image;

        const updated = await prisma.product.update({
            where: { id },
            data: newData
        });
        return updated;
        
    } catch (error) {
        return null;
    }
}

// delete
async function deleteProduct(id) {
    try {
        await prisma.product.delete({
            where: { id }
        });
        return true;
    } catch (error) {
        return false;
    }
}

export default {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
