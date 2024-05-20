import {createTransport} from "nodemailer";

export const sendEmail = async(email,subject,text)=>{
    const transport = createTransport({
        service:"gmail",
        auth:{
            user:"mailme.charantej4@gmail.com",
            pass:"zlzxedyglfhnjnga",
        },
    });

    await transport.sendMail({
        sender:"mailme.charantej4@gmail.com",
        to:email,
        subject,
        text,
    });
};