import { Request, Response } from 'express';
import { Category } from '../models/category.model';

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const createdBy = req.user?._id;

    // Create slug from name
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    const category = new Category({
      name,
      description,
      slug,
      createdBy,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res
        .status(400)
        .json({ error: 'Category with this name already exists' });
    }
    res.status(500).json({ error: 'Error creating category' });
  }
};

export const listCategories = async (req: Request, res: Response) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (search) {
      query.$text = { $search: search as string };
    }

    const categories = await Category.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Category.countDocuments(query);

    res.json({
      categories,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching categories' });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId).populate(
      'createdBy',
      'name email',
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching category' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;
    const userId = req.user?._id;

    const category = await Category.findOne({
      _id: categoryId,
      createdBy: userId,
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    if (name) {
      category.name = name;
      category.slug = name.toLowerCase().replace(/\s+/g, '-');
    }
    if (description) {
      category.description = description;
    }

    await category.save();
    res.json(category);
  } catch (error) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return res
        .status(400)
        .json({ error: 'Category with this name already exists' });
    }
    res.status(500).json({ error: 'Error updating category' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params;
    const userId = req.user?._id;

    const category = await Category.findOne({
      _id: categoryId,
      createdBy: userId,
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.deleteOne();
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting category' });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({ slug }).populate(
      'createdBy',
      'name email',
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching category' });
  }
};
