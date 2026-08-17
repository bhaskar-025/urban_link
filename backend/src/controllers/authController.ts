import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'citysync_fallback_secret_alpha_090X', {
    expiresIn: '30d',
  });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, city, phoneNumber } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400).json({ message: 'Citizen unit already authenticated in system' });
      return;
    }

    const user = await User.create({ 
      name, 
      email, 
      password,
      role: role || 'citizen',
      city: city || '',
      phoneNumber
    });
    if (user) {
      res.status(201).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        phoneNumber: user.phoneNumber,
        token: generateToken(String(user._id), user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid data parameters' });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        city: user.city,
        phoneNumber: user.phoneNumber,
        token: generateToken(String(user._id), user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid protocol credentials' });
    }
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
}
