const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SG_API)

const sendWelcome = (email, name) => {
    const text = `Hello ${name},
    
    Thank you for joining my test! We'll be adding more functionality soon!`
    sgMail.send({
        to: email,
        from: 'admin@illserver.xyz',
        subject: 'Welcome to the IllLogic Task Manager',
        text
    })
}

const sendCancel = (email, name) => {
    const text = `Hello ${name},
    
    We're sorry to see you go!
    
    If you wouldn't mind, please send us a reply to let us know why you decided to cancel your account.`

    sgMail.send({
        to: email,
        from: 'admin@illserver.xyz',
        subject: 'Oh noooooo! Sorry to see you go!',
        text
    })
}

module.exports = { sendWelcome, sendCancel }