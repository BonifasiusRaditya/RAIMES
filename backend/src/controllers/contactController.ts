import type { Request, Response } from 'express';
import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER || 'your-email@gmail.com',
            pass: process.env.EMAIL_PASSWORD || 'your-app-password'
        }
    });
};

export const sendContactEmail = async (req: Request, res: Response) => {
    try {
        const { name, email, institution, inquiryType, message } = req.body;

        // Validation
        if (!name || !email || !institution || !message) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Create transporter
        const transporter = createTransporter();

        // Email to RAIMES team (aryautomo11@gmail.com)
        const mailOptionsToTeam = {
            from: process.env.EMAIL_USER || 'noreply@raimes.com',
            to: 'aryautomo11@gmail.com',
            subject: `RAIMES Contact Form: ${inquiryType || 'General Inquiry'}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #6B46C1; padding: 20px; text-align: center;">
                        <h1 style="color: #FCD34D; margin: 0;">RAIMES Contact Form</h1>
                    </div>
                    <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
                        <h2 style="color: #374151; margin-top: 0;">New Contact Inquiry</h2>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                        <strong style="color: #6B46C1;">Name:</strong>
                                    </td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                        ${name}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                        <strong style="color: #6B46C1;">Email:</strong>
                                    </td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                        <a href="mailto:${email}" style="color: #2563eb;">${email}</a>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                        <strong style="color: #6B46C1;">Institution/Company:</strong>
                                    </td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                        ${institution}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                        <strong style="color: #6B46C1;">Inquiry Type:</strong>
                                    </td>
                                    <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">
                                        ${inquiryType || 'General Inquiry'}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 0;" colspan="2">
                                        <strong style="color: #6B46C1;">Message:</strong>
                                        <div style="margin-top: 10px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #6B46C1; border-radius: 4px;">
                                            ${message.replace(/\n/g, '<br>')}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        
                        <div style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px;">
                            <p>This message was sent from the RAIMES Contact Form</p>
                            <p style="margin: 5px 0;">Received at: ${new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })} WIB</p>
                        </div>
                    </div>
                    <div style="background-color: #374151; padding: 15px; text-align: center;">
                        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                            © 2024 RAIMES - Responsible AI for Mining Excellence and Sustainability
                        </p>
                    </div>
                </div>
            `
        };

        // Auto-reply email to sender
        const mailOptionsToSender = {
            from: process.env.EMAIL_USER || 'noreply@raimes.com',
            to: email,
            subject: 'Thank you for contacting RAIMES',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background-color: #6B46C1; padding: 20px; text-align: center;">
                        <h1 style="color: #FCD34D; margin: 0;">RAIMES</h1>
                        <p style="color: white; margin: 5px 0;">Responsible AI for Mining Excellence and Sustainability</p>
                    </div>
                    <div style="background-color: #f9fafb; padding: 30px; border: 1px solid #e5e7eb;">
                        <h2 style="color: #374151; margin-top: 0;">Thank You for Reaching Out!</h2>
                        
                        <p style="color: #4b5563; line-height: 1.6;">
                            Dear ${name},
                        </p>
                        
                        <p style="color: #4b5563; line-height: 1.6;">
                            We have received your inquiry and appreciate you taking the time to contact us. 
                            Our team will review your message and get back to you as soon as possible, typically within 24-48 hours.
                        </p>
                        
                        <div style="background-color: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FCD34D;">
                            <h3 style="color: #6B46C1; margin-top: 0;">Your Inquiry Details:</h3>
                            <p style="margin: 5px 0;"><strong>Type:</strong> ${inquiryType || 'General Inquiry'}</p>
                            <p style="margin: 5px 0;"><strong>Institution:</strong> ${institution}</p>
                            <p style="margin: 5px 0;"><strong>Message:</strong></p>
                            <div style="padding: 10px; background-color: #f9fafb; border-radius: 4px; margin-top: 5px;">
                                ${message.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        
                        <p style="color: #4b5563; line-height: 1.6;">
                            In the meantime, feel free to explore our platform and learn more about how RAIMES 
                            is helping mining companies achieve sustainable and responsible practices.
                        </p>
                        
                        <div style="text-align: center; margin-top: 30px;">
                            <p style="color: #6b7280; font-size: 14px;">
                                If you have any urgent questions, please don't hesitate to reach out directly at 
                                <a href="mailto:aryautomo11@gmail.com" style="color: #6B46C1;">aryautomo11@gmail.com</a>
                            </p>
                        </div>
                    </div>
                    <div style="background-color: #374151; padding: 15px; text-align: center;">
                        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
                            © 2024 RAIMES - Responsible AI for Mining Excellence and Sustainability
                        </p>
                    </div>
                </div>
            `
        };

        // Send emails
        await transporter.sendMail(mailOptionsToTeam);
        await transporter.sendMail(mailOptionsToSender);

        console.log('✅ Contact email sent successfully to aryautomo11@gmail.com');
        console.log('✅ Auto-reply sent to:', email);

        res.status(200).json({
            success: true,
            message: 'Message sent successfully! We will get back to you soon.'
        });

    } catch (error) {
        console.error('❌ Error sending contact email:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send message. Please try again later.',
            error: process.env.NODE_ENV === 'development' ? error : undefined
        });
    }
};
