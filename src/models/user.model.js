const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")


const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:[true, "Email is required to creating User account"],
        trim:true,
        unique:[true, "Email already exists"],
        lowercase:true,
        match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            "Invalid Email Address"
        ]
    },

    name:{
        type:String,
        required:[true, "Name is required to creating an account"]
    },

    password:{
        type:String,
        required:[true, "Password is required for creating an account"],
        minlength:[5, "Password should contain more than 5 character"],
        select:false
    },

    systemUser:{
        type:Boolean,
        default:false,
        immutable:true,
        select:false,
    }
}, {
    timestamps:true
})


userSchema.pre("save", async function(){

        if(!this.isModified("password")){
            return
        }


        const hash = await bcrypt.hash(this.password, 10)
        this.password = hash

        return

})



userSchema.methods.comparePassword = async function(password){
        return await bcrypt.compare(password, this.password)
}



const userModel = mongoose.model("user", userSchema)




module.exports = userModel