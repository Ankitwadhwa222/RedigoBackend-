const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/User")

const JWT_SECRET = process.env.JWT_SECRET;


const genrateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
    expiresIn: "7d",
  });
}

const registerUser = async ({name, email, password}) => {
      
     const existingUser = await UserModel.findOne({email});
     if(existingUser) throw new Error("User already exists with this email");

      
     const salt = await bcrypt.genSalt(10);
     const hashedPassword = await bcrypt.hash(password, salt);

     const user = await UserModel.create({
          name,
          email,
          password : hashedPassword
     });

     if(user) {
     return {
          id : user._id,
          name : user.name,
          email : user.email,
          token : genrateToken(user)
     }
}

}

const loginUser = async({email , password}) => {
     const user = await UserModel.findOne({email});
     if(!user){
          throw new Error("Invalid email or password");
     }
     const isMatch = await bcrypt.compare(password, user.password);
     if(!isMatch){
          throw new Error("Invalid email or password");
     }
     return {
          _id : user._id,
          name : user.name,
          email : user.email,
          token : genrateToken(user)
     };
};


module.exports = {
     signup : registerUser,
     signin : loginUser
}