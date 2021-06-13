import nodemailer from "nodemailer"

export default function Email(options) {
  return {
    id: "email",
    type: "email",
    name: "Email",
    // Server can be an SMTP connection string or a nodemailer config object
    server: {
      host: "localhost",
      port: 25,
      auth: {
        user: "",
        pass: "",
      },
    },
    from: "NextAuth <no-reply@example.com>",
    maxAge: 24 * 60 * 60,
    sendVerificationRequest,
    ...options,
  }
}

async function sendVerificationRequest(params) {
  const { identifier, url, baseUrl, provider } = params
  const { server, from } = provider
  const transport = nodemailer.createTransport(server)
  const { domain } = new URL(baseUrl)

  const props = {
    url,
    // Insert invisible space into domain and email address to prevent both
    // being turned into a hyperlink by email clients like Outlook and Apple mail
    // as this is confusing because it seems like they are supposed to click
    // on their email address to sign in.
    domain: `${domain.replace(/\./g, "&#8203;.")}`,
    identifier: `${identifier.replace(/\./g, "&#8203;.")}`,
  }

  await transport.sendMail({
    to: identifier,
    from,
    subject: `Sign in to ${domain}`,
    text: text(props),
    html: html(props),
  })
}

/** Email HTML body */
function html({ url, domain, identifier }) {
  // Some simple styling options
  const colors = {
    background: "#f9f9f9",
    text: "#444444",
    mainBackground: "#ffffff",
    buttonBackground: "#346df1",
    buttonBorder: "#346df1",
    buttonText: "#ffffff",
  }

  return `
<body style="background: ${colors.background};">
  <table width="100%" border="0" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center" style="padding: 10px 0px 20px 0px; font-size: 22px; font-family: Helvetica, Arial, sans-serif; color: ${colors.text};">
        <strong>${domain}</strong>
      </td>
    </tr>
  </table>
  <table width="100%" border="0" cellspacing="20" cellpadding="0" style="background: ${colors.mainBackground}; max-width: 600px; margin: auto; border-radius: 10px;">
    <tr>
      <td align="center" style="padding: 10px 0px 0px 0px; font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${colors.text};">
        Sign in as <strong>${identifier}</strong>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td align="center" style="border-radius: 5px;" bgcolor="${colors.buttonBackground}"><a href="${url}" target="_blank" style="font-size: 18px; font-family: Helvetica, Arial, sans-serif; color: ${colors.buttonText}; text-decoration: none; text-decoration: none;border-radius: 5px; padding: 10px 20px; border: 1px solid ${colors.buttonBorder}; display: inline-block; font-weight: bold;">Sign in</a></td>
          </tr>
        </table>
      </td>
    </tr>
    <tr>
      <td align="center" style="padding: 0px 0px 10px 0px; font-size: 16px; line-height: 22px; font-family: Helvetica, Arial, sans-serif; color: ${colors.text};">
        If you did not request this email you can safely ignore it.
      </td>
    </tr>
  </table>
</body>
`
}

/** Email Text body (fallback for email clients that don't render HTML, e.g. feature phones) */
function text({ url, domain, identifier }) {
  return `Sign in to ${domain} as ${identifier}\n${url}\n\n`
}
