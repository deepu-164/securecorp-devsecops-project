const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	    service: "gmail",
	    auth: {
		            user: process.env.EMAIL_USER,
		            pass: process.env.EMAIL_PASS
		        }
});

async function sendResetEmail(email, token) {

	    const resetLink =
		        `http://localhost:3000/reset-password/${token}`;

	    await transporter.sendMail({

		            from: process.env.EMAIL_USER,

		            to: email,

		            subject: "SecureCorp Password Reset",

		            html: `
			                <h2>Password Reset</h2>

					            <p>You requested to reset your password.</p>

						                <a href="${resetLink}">
								                Reset Password
										            </a>

											                <p>This link expires in one hour.</p>
													        `

		        });

}

module.exports = {
	    sendResetEmail
};
