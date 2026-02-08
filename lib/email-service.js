import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Builds the HTML email template for the found item notification.
 */
function buildEmailTemplate(data) {
  const { itemName, finderEmail, foundLocation, message, itemId, appUrl } = data;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 30px 20px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { padding: 30px; background: #ffffff; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .item-card { background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb; }
        .button { 
          display: inline-block; 
          background: #10b981; 
          color: white; 
          padding: 14px 28px; 
          text-decoration: none; 
          border-radius: 8px; 
          font-weight: bold;
          margin: 10px 0;
          text-align: center;
        }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; margin-top: 20px; }
        h1 { margin: 0; font-size: 24px; }
        h2 { margin: 10px 0 0; font-size: 18px; font-weight: normal; opacity: 0.9; }
        .label { font-weight: bold; color: #4b5563; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { margin-bottom: 12px; font-size: 16px; color: #111827; }
      </style>
    </head>
    <body style="background-color: #f3f4f6; padding: 20px;">
      <div class="container">
        <div class="header">
          <h1>🎓 Campus Lost & Found</h1>
          <h2>Your Item Has Been Found!</h2>
        </div>
        
        <div class="content">
          <p style="font-size: 18px;">Hello,</p>
          <p>Good news! Someone found your lost item on campus.</p>
          
          <div class="item-card">
            <div class="label">Item Found</div>
            <div class="value">📦 ${itemName}</div>
            
            <div class="label">Found Location</div>
            <div class="value">📍 ${foundLocation}</div>
            
            <div class="label">Date Found</div>
            <div class="value">🗓️ ${new Date().toLocaleDateString()}</div>
            
            ${message ? `
              <div style="background: #ffffff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #2563eb;">
                <div class="label">Message from Finder</div>
                <div style="font-style: italic;">"${message}"</div>
              </div>
            ` : ''}
            
            <div class="label">Finder's Contact Email</div>
            <div class="value">📧 ${finderEmail}</div>
          </div>
          
          <p style="margin: 25px 0;">
            <strong>Next Steps:</strong><br>
            1. Reply directly to the finder to arrange pickup.<br>
            2. Meet in a safe, public place on campus.<br>
            3. Verify the item is yours.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="mailto:${finderEmail}?subject=Re: Found Item - ${itemName}" class="button">
              ✉️ Reply to Finder
            </a>
            <div style="margin-top: 15px;">
                <p style="margin-bottom: 5px;">Or confirm via the platform:</p>
                <a href="${appUrl}/claim/${data.alertId}" style="color: #2563eb; font-weight: bold; text-decoration: none;">
                View Item & Verify Claim →
                </a>
            </div>
          </div>
          
          <div style="background: #fffbeb; padding: 15px; border-radius: 6px; margin-top: 20px; border: 1px solid #fcd34d;">
            <strong>🔒 Safety Tip:</strong> Meet in public, well-lit areas like the Student Center or Library. Bring a friend if possible.
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} Campus Lost & Found</p>
          <p>This is an automated notification. Verify all claims personally.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Sends notifications email using Nodemailer.
 */
export async function sendFoundItemEmail({
  to,
  itemName,
  finderEmail,
  foundLocation,
  message,
  itemId,
  alertId,
  appUrl
}) {
  try {
    console.log(`[Email Service] Sending email to: ${to}`);

    // Construct email data
    const emailContent = buildEmailTemplate({
      itemName,
      finderEmail,
      foundLocation,
      message,
      itemId,
      alertId,
      appUrl
    });

    // Use Nodemailer to send the email
    const info = await transporter.sendMail({
      from: `"Campus Lost & Found" <${process.env.SMTP_EMAIL}>`,
      to: to,
      replyTo: finderEmail, // Allows direct reply
      subject: `🎉 Good News! Your "${itemName}" has been found`,
      html: emailContent,
    });

    console.log('[Email Service] Email sent successfully:', info.messageId);
    return { success: true, emailId: info.messageId };

  } catch (error) {
    console.error('[Email Service] Failed to send email:', error);
    return { success: false, error: error.message || 'Unknown email error' };
  }
}

export async function sendMatchNotification({
  to,
  itemName,
  matchType, // 'lost_match' or 'found_match'
  matchedItemDetails,
  appUrl
}) {
  try {
    const subject = `🔎 Potential Match: We found a similar item to your "${itemName}"!`;

    const html = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #2563eb; padding: 20px; text-align: center; color: white; border-radius: 10px 10px 0 0;">
                <h1>Smart Match Alert! 🔎</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 10px 10px;">
                <p>Hello,</p>
                <p>Good news! Our system detected a potential match for the <strong>"${itemName}"</strong> you reported.</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Matched Item Details:</h3>
                    <p><strong>Item:</strong> ${matchedItemDetails.itemName}</p>
                    <p><strong>Location:</strong> ${matchedItemDetails.lastSeenLocation}</p>
                    <p><strong>Date:</strong> ${new Date(matchedItemDetails.dateLost).toLocaleDateString()}</p>
                    <p><strong>Description:</strong> ${matchedItemDetails.description}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                    <a href="${appUrl}/dashboard" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        View Match on Dashboard
                    </a>
                </div>

                <p style="font-size: 12px; color: #6b7280; text-align: center;">
                    Please verify the details carefully. Do not share sensitive personal info until you are sure.
                </p>
            </div>
        </div>
        `;

    const info = await transporter.sendMail({
      from: `"Campus Lost & Found" <${process.env.SMTP_EMAIL}>`,
      to: to,
      subject: subject,
      html: html,
    });

    return { success: true, emailId: info.messageId };

  } catch (error) {
    console.error('[Email Service] Match notification failed:', error);
    return { success: false, error };
  }
}

/**
 * Sends a confirmation email to the finder when the owner accepts the match.
 */
export async function sendOwnerConfirmationEmail({
  to,
  itemName,
  meetingDetails
}) {
  try {
    const info = await transporter.sendMail({
      from: `"Campus Lost & Found" <${process.env.SMTP_EMAIL}>`,
      to: to,
      subject: `Update: The owner confirmed your find! (${itemName})`,
      html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                    <h1 style="color: #16a34a;">It's a Match!</h1>
                    <p>The owner of the <strong>${itemName}</strong> has confirmed it is theirs.</p>
                    
                    <div style="background-color: #f0fdf4; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #bbf7d0;">
                        <h3 style="margin-top: 0; color: #15803d;">Meeting Instructions from Owner</h3>
                        <p style="font-size: 16px; line-height: 1.5; color: #374151;">"${meetingDetails}"</p>
                    </div>

                    <p>Please meet them at the specified location to return the item.</p>
                    <p>Thank you for helping keep our campus honest!</p>
                </div>
            `,
    });
    return { success: true, emailId: info.messageId };
  } catch (error) {
    console.error('[Email Service] Owner confirmation notification failed:', error);
    return { success: false, error };
  }
}
