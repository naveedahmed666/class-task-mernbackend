const Food = require('../models/Food');
const Category = require('../models/Category');
const fs = require('fs');
const path = require('path');

// 1. ADD Food
exports.createFood = async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Food image is required' });
        }

        // Verify if the referenced Category exists
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            fs.unlinkSync(req.file.path); // Clean up file if validation fails
            return res.status(404).json({ success: false, message: 'Selected category not found' });
        }

        const imagePath = `/uploads/foods/${req.file.filename}`;

        const newFood = new Food({
            name,
            price,
            description,
            category,
            image: imagePath
        });

        await newFood.save();
        res.status(201).json({ success: true, message: 'Food item created successfully', data: newFood });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. DISPLAY Foods (With populated Category info)
exports.getFoods = async (req, res) => {
    try {
        const foods = await Food.find()
            .populate('category', 'name description') // Populates category data
            .sort({ createdAt: -1 });
            
        res.status(200).json({ success: true, count: foods.length, data: foods });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFoodById = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id).populate('category', 'name description');
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food item not found' });
        }
        res.status(200).json({ success: true, data: food });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. EDIT Food
exports.updateFood = async (req, res) => {
    try {
        const { name, price, description, category } = req.body;
        const food = await Food.findById(req.params.id);

        if (!food) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ success: false, message: 'Food item not found' });
        }

        // If category is changing, verify the new category exists
        if (category) {
            const categoryExists = await Category.findById(category);
            if (!categoryExists) {
                if (req.file) fs.unlinkSync(req.file.path);
                return res.status(404).json({ success: false, message: 'Selected category not found' });
            }
        }

        let imagePath = food.image;

        // Replace image if a new one is provided
        if (req.file) {
            const oldImagePath = path.join(__dirname, '..', food.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
            imagePath = `/uploads/foods/${req.file.filename}`;
        }

        food.name = name || food.name;
        food.price = price !== undefined ? price : food.price;
        food.description = description || food.description;
        food.category = category || food.category;
        food.image = imagePath;

        await food.save();
        res.status(200).json({ success: true, message: 'Food item updated successfully', data: food });
    } catch (error) {
        if (req.file) fs.unlinkSync(req.file.path);
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. DELETE Food
exports.deleteFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food item not found' });
        }

        // Remove the image file from server
        const imagePath = path.join(__dirname, '..', food.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        await Food.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Food item deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};