---
id: email
title: Email
---

## Overview

The Email provider uses email to send "magic links" that can be used to sign in, you will likely have seen these if you have used services like Slack before.

Adding support for signing in via email in addition to one or more OAuth services provides a way for users to sign in if they lose access to their OAuth account (e.g. if it is locked or deleted).

The Email provider can be used in conjunction with (or instead of) one or more OAuth providers.

### How it works

On initial sign in, a **Verification Token** is sent to the email address provided. By default this token is valid for 24 hours. If the Verification Token is used with that time (i.e. by clicking on the link in the email) an account is created for the user and they are signed in.

If someone provides the email address of an _existing account_ when signing in, an email is sent and they are signed into the account associated with that email address when they follow the link in the email.

:::tip
The Email Provider can be used with both JSON Web Tokens and database sessions, but you **must** configure a database to use it. It is not possible to enable email sign in without using a database.
:::

## Configuration

1. You will need an SMTP account; ideally for one of the [services known to work with `nodemailer`](http://nodemailer.com/smtp/well-known).
2. There are two ways to configure the SMTP server connection.

You can either use a connection string or a `nodemailer` configuration object.

2.1 **Using a connection string**

Create an `.env` file to the root of your project and add the connection string and email address.

```js title=".env" {1}
EMAIL_SERVER=smtp://username:password@smtp.example.com:587
EMAIL_FROM=noreply@example.com
```

Now you can add the email provider like this:

```js {3} title="pages/api/auth/[...nextauth].js"
providers: [
  Providers.Email({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM
  }),
],
```

2.2 **Using a configuration object**

In your `.env` file in the root of your project simply add the configuration object options individually:

```js title=".env"
EMAIL_SERVER_USER=username
EMAIL_SERVER_PASSWORD=password
EMAIL_SERVER_HOST=smtp.example.com
EMAIL_SERVER_PORT=587
EMAIL_FROM=noreply@example.com
```

Now you can add the provider settings to the NextAuth options object in the Email Provider.

```js title="pages/api/auth/[...nextauth].js"
providers: [
  Providers.Email({
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD
      }
    },
    from: process.env.EMAIL_FROM
  }),
],
```

3. You can now sign in with an email address at `/api/auth/signin`.

A user account (i.e. an entry in the Users table) will not be created for the user until the first time they verify their email address. If an email address is already associated with an account, the user will be signed in to that account when they use the link in the email.

## Options

The **Email Provider** comes with a set of default options:

- [Email Provider options](https://github.com/nextauthjs/next-auth/blob/main/src/providers/email.js)

You can override any of the options to suit your own use case.

## Customizing emails

You can also fully customize the contents of the sign in email that is sent by passing a custom function as the `sendVerificationRequest` option to `Providers.Email()`. For example:

```js {3} title="pages/api/auth/[...nextauth].js"
providers: [
  Providers.Email({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM,
    async sendVerificationRequest({
      identifier,
      url,
      baseUrl,
      token,
      provider
    }) {
      /* your e-mail sending logic */
    },
  }),
]
```

You can find the source code of the default `sendVerificationRequest()` method [here](https://github.com/nextauthjs/next-auth/blob/main/src/providers/email.js).

:::tip
If you want to generate great looking and email client compatible HTML with React, check out [MJML](https://mjml.io).
:::
:::tip
[Can I email](https://www.caniemail.com) is a great resource to check for email client compatibility of HTML and CSS features. (It's like [Can I use](https://caniuse.com), but for email clients instead of browsers.)
:::

## Customizing the Verification Token

By default, we are generating a random verification token. You can define a `generateVerificationToken` method in your provider options if you want to override it:

```js title="pages/api/auth/[...nextauth].js"
providers: [
  Providers.Email({
    async generateVerificationToken() {
      return "ABC123"
    }
  })
],
```
