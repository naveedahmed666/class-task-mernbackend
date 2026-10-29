const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// 1. CREATE (POST) - Naya food item add karne ke liye
router.post('/', async (req, res) => {
    try {
        const { name, price, description, category, image } = req.body;

        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Name, price, and category are required!' });
        }

        const newFood = new Food({
            name,
            price,
            description,
            category,
            image
        });

        const savedFood = await newFood.save();
        res.status(201).json({
            message: 'Food item added successfully!',
            data: savedFood
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. READ ALL (GET) - Saare food items dekhne ke liye (Category details ke sath)
router.get('/', async (req, res) => {
    try {
        const foods = await Food.find().populate('category', 'name'); // Category ki ID ki jagah uska naam bhi show karega
        res.status(200).json({
            success: true,
            count: foods.length,
            data: foods
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. READ SINGLE (GET) - ID ke zariye ek food item nikalne ke liye
router.get('/:id', async (req, res) => {
    try {
        const food = await Food.findById(req.params.id).populate('category', 'name');
        if (!food) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.status(200).json({ success: true, data: food });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. UPDATE (PUT) - Food item edit karne ke liye
router.put('/:id', async (req, res) => {
    try {
        const { name, price, description, category, image } = req.body;

        const updatedFood = await Food.findByIdAndUpdate(
            req.params.id,
            { name, price, description, category, image },
            { new: true, runValidators: true }
        );

        if (!updatedFood) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        res.status(200).json({
            message: 'Food item updated successfully!',
            data: updatedFood
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. DELETE (DELETE) - Food item delete karne ke liye
router.delete('/:id', async (req, res) => {
    try {
        const deletedFood = await Food.findByIdAndDelete(req.params.id);

        if (!deletedFood) {
            return res.status(404).json({ error: 'Food item not found' });
        }

        res.status(200).json({
            message: 'Food item deleted successfully!',
            data: deletedFood
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;