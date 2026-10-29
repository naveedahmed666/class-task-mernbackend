const express = require('express');
const router = express.Router();
const Category = require('../models/Category'); // Category Model import kiya

// 1. CREATE (POST) - Nayi category banane ke liye
router.post('/', async (req, res) => {
    try {
        const { name, description } = req.body;
        
        // Check karo ke name diya hai ya nahi
        if (!name) {
            return res.status(400).json({ error: 'Category name is required' });
        }

        const newCategory = new Category({ name, description });
        const savedCategory = await newCategory.save();
        
        res.status(201).json({
            message: 'Category created successfully!',
            data: savedCategory
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. READ ALL (GET) - Saari categories dekhne ke liye
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. READ SINGLE (GET) - ID ke zariye ek category nikalne ke liye
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. UPDATE (PUT/PATCH) - Category edit karne ke liye
router.put('/:id', async (req, res) => {
    try {
        const { name, description } = req.body;

        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            { name, description },
            { new: true, runValidators: true } // updated data return karega
        );

        if (!updatedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({
            message: 'Category updated successfully!',
            data: updatedCategory
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. DELETE (DELETE) - Category delete karne ke liye
router.delete('/:id', async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({ error: 'Category not found' });
        }

        res.status(200).json({
            message: 'Category deleted successfully!',
            data: deletedCategory
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;