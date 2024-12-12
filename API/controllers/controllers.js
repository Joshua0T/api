const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require ('nodemailer')

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


exports.updateUser = async (req,res) => {
  const {id} = req.params;
  const {nombre,correo} = req.body;
  try{
    const user = await User.findByIdAndUpdate(
      id,
      {nombre,correo},
      {new:true}
    );
    if(!user){
      return res.status(404).json({error: 'usuario no encontrado'});
    }
    res.json({message:'usuario actualizado con exito',user});
  }catch(error){
    res.status(500).json({error:'error al actualizar',details:error.message});
  }
},

exports.deleteUser = async (req,res) => {
  const {id} = req.params;
  try {
    const user = await User.findByIdAndDelete(id);
    if(!user){
      return res.status(404).json({error: 'usuario no encontrado'})
    }
    res.json({message:'usuario eliminado'})
  }catch(error){
    res.status(500).json({error:'erro al eliminar'})
  }
}


exports.recoverPassword = async (req,res) => {
  const {correo} = req.body;
  try {
    const user = await user.findOne({correo});
    if(!user){
      return res.status(404).json({error:'usuario no encontrado'});
    }

    const token =jwt.sign ({id:user._id}, process.env.JWT_SECRET,{expiresIn:'1H'});

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASSWORD,
      },
    });
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to:correo,
      subjeact: 'recuperacion de contraseña',
      text:`Para restablecer tu contraseña, haz clic en el siguiente enlace: 
         http://localho;st:5008/reset-password/${token}`,
    };
    await transporter.sendMail(mailOptions);
    res.json({message: 'recuperacion enviada'});
  }catch(err){
    res.status(500).json({error: 'error al enviar recuperacion',details:err.message});
  }
};



exports.resetPassword = async (req,res) => {
  const {token} = req.params;
  const {nuevaContraseña} = req.body;
  try {
    const decoded = jwt.verify(token,process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if(!user){
      return res.status(404).json({error: 'usuario no encontrado'});
    }

    const hashedPassword = await bcrypt.hash(nuevaContraseña.trim(),10);

    user.contraseña = hashedPassword;
    await user.save();
    
    res.json({message: 'contraseña restablecida'});
  }catch(error){
    res.status(403).json({error:' token invalidado o expirado'})
  }
}
