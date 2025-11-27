
import prisma from "../lib/prisma.js";

export async function seedAll(req, res) {
  try {
    const exist = await prisma.category.findFirst();
    if (exist) {
      return res.status(400).json({
        success: false,
        message: "already"
      });
    }

    await prisma.category.createMany({
      data: [
        { name: "Electronics" },
        { name: "Fashion" },
        { name: "Food" }
      ]
    });

    await prisma.size.createMany({
      data: [
        { name: "Reguler", add_price: 0 },
        { name: "Medium", add_price: 2000 },
        { name: "Large", add_price: 4000 }
      ]
    });

    await prisma.method.createMany({
      data: [
        { name: "Dine-in", add_price: 0 },
        { name: "Pick Up", add_price: 3000 },
        { name: "Delivery", add_price: 5000 }
      ]
    });

    return res.json({
      success: true,
      message: " completed!"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: " failed",
      error: err.message
    });
  }
}

