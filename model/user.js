const { createHmac, randomBytes } = require('crypto');
const {Schema, model} = require ("mongoose");
const {createTokenForUser} = require("../services/authentication");

const UserSchema = new Schema({
    fullName: {
        type : String,
        required : true,
    },
    email: {
        type : String,
        required : true,
        unique : true,
    },
    salt: {
        type : String,
     
    },
    password:{
        type : String,
        required : true,
    },
    profileImageURL: {
        type : String,
        default :"/images/default.png"
    },
    role:{
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    }
}, {timestamps:true});

UserSchema.pre("save", function (next) {
    const user = this;

    if (!user.isModified("password")) return next();

// const salt = 'someRandom';
    const salt = randomBytes(16).toString("hex");
    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");

    user.salt = salt;
    user.password = hashedPassword;
    next();
});

UserSchema.static("matchPasswordAndGenerateToken", async function (email , password){
    const user = await this.findOne({email});
    if(!user) throw new Error('User not found');
    // console.log(user);
    if(!user) return false;
    const salt = user.salt;
    const hashedPassword = user.password;
    const userProvidedHash = createHmac("sha256", salt).update(password).digest("hex");


    if (hashedPassword !== userProvidedHash) throw new Error ('Incorrect password');

    const token = createTokenForUser(user);
    return token;
    // return user;

    // return { ...user, password : undefined, salt:undefined};
   
});

const User = model('user', UserSchema);

module.exports = User;