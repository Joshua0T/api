const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
  const { nombre, apellido, correo,contraseña } = req.body;
  console.log(nombre);
  console.log(correo);
  console.log(contraseña);
  
  try {
    // Cifrar la contraseña
    const hashedPassword = await bcrypt.hash(contraseña.trim(), 10);  // Usar .trim() para quitar espacios
    const user = new User({ nombre, apellido, correo, contraseña: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado con éxito' });
  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'El correo ya está registrado' });
    } else {
      res.status(400).json({ error: 'Error al registrar usuario', details: err.message });
    }
  }
};

exports.login = async (req, res) => {
  const { correo, contraseña } = req.body;
  try {
    // Buscar usuario por correo
    const user = await User.findOne({ correo });

    // Verificar si el usuario existe
    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    // Log: Verificar si se encuentra el usuario
    console.log('Usuario encontrado:', user.contraseña);

    // Depuración: Verificar las contraseñas
    console.log('Contraseña ingresada:', contraseña.trim());
    console.log('Contraseña almacenada en la base de datos:', user.contraseña);

    // Comparar la contraseña ingresada con la almacenada usando el método de la instancia

    const comparePassword = await bcrypt.compare(contraseña,user.contraseña)
    console.log(comparePassword);
    
    if(comparePassword === false) return res.status(400).json({message: 'Contraseña incorrectos.'});

    // Generar el token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Inicio de sesión exitoso', token });
  } catch (err) {
    res.status(500).json({ error: 'Error al iniciar sesión', details: err.message });
  }
};



exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios', details: err.message });
  }
};
