import nodemailer from "nodemailer";

const email = process.env.CONTACT_EMAIL;
const pass = process.env.CONTACT_PASSWORD;

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user:email, 
        pass
    },
});

export const mailOptions = {
    from: email,
    to:email,
}