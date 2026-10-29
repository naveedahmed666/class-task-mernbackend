const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

// 1. ADD Category
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Category image is required' });
        }

        const imagePath = `/uploads/categories/${req.file.filename}`;

        const newCategory = new Category({
            name,
            description,
            image: imagePath
        });

        await newCategory.save();
        res.status(201).json({ success: true, message: 'Category created successfully', data: newCategory });
    } catch (error) {
        // Remove uploaded file if database save fails
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. DISPLAY Categories (List all or Get single)
exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: categories.length, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.status(200).json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. EDIT Category
exports.updateCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        const category = await Category.findById(req.params.id);

        if (!category) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        let imagePath = category.image;

        // If a new image is uploaded, delete the old one and update path
        if (req.file) {
            const oldImagePath = path.join(__dirname, '..', category.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            imagePath = `/uploads/categories/${req.file.filename}`;
        }

        category.name = name || category.name;
        category.description = description || category.description;
        category.image = imagePath;

        await category.save();
        res.status(200).json({ success: true, message: 'Category updated successfully', data: category });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. DELETE Category
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }

        // Remove image file from server storage
        const imagePath = path.join(__dirname, '..', category.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};