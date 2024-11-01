# Share-X-Upload
ShareX upload script made for file sharing CDN system with filetype support!

Disclaimer: ShareX is a free and open source program that lets you capture or record any area of your screen and share it with a single press of a key.
The program can be found over at https://getsharex.com/

## Installation

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the required dependencies using `bun install`.
4. Start the server using `bun run index.js`.
5. Configure the `example.sxcu` file with your domain name and other settings.
6. Import the `example.sxcu` file into ShareX.
7. You should now be able to upload files directly to your site via ShareX.

## Configuration

### `upload.js`

- **Tokens**: Add your tokens to the `tokens` array in `upload.js`. These tokens are used to authenticate the upload requests.
- **Allowed File Types**: Configure the allowed file types by modifying the `allowedFiles` array in `upload.js`.
- **Maximum File Size**: Set the maximum file size for uploads by changing the `maxFileSize` variable in `upload.js`.

### `example.sxcu`

- **Version**: The version of the ShareX configuration file.
- **Name**: The name of the configuration.
- **DestinationType**: The type of destination (e.g., ImageUploader, TextUploader, FileUploader).
- **RequestType**: The type of HTTP request (e.g., POST).
- **RequestURL**: The URL of the `upload.js` script on your server.
- **Body**: The body type of the request (e.g., MultipartFormData).
- **FileFormName**: The name of the form field for the file upload (e.g., sharex).
- **URL**: The URL format for the uploaded file.

### Session Management

- **SESSION_SECRET**: Set the `SESSION_SECRET` environment variable to a strong, unique value. This is used for session management in `index.js`.

To set the `SESSION_SECRET` environment variable, you can use the following command in your terminal:

```sh
export SESSION_SECRET=your_secret_key
```

Replace `your_secret_key` with a strong, unique value.

## Usage

1. Open ShareX and go to `Destinations` > `Custom uploaders`.
2. Click on `Import` and select the `example.sxcu` file.
3. Configure the uploader settings as needed.
4. Use ShareX to capture or record your screen and upload the file using the custom uploader.

### Viewing Uploaded Images

To view uploaded images, visit the URL `https://YourDomain.com/view_image.php?id=<image_id>`. Replace `<image_id>` with the actual image ID.

## Error Handling and Logging

The `upload.js` script includes error handling and logging mechanisms. Errors are logged to the `error_log.txt` file in the same directory as the script. The script returns appropriate HTTP status codes and error messages in the JSON response.

## Security

- Ensure that the `upload.js` script is not publicly accessible without proper authentication.
- Use strong and unique tokens for authentication.
- Regularly review and update the allowed file types and maximum file size settings.

## MySQL Setup

1. Install MySQL on your server if it is not already installed.
2. Create a new database for the ShareX upload system.
3. Import the provided `database.sql` file to create the necessary tables.
4. Update the `config.js` file with your MySQL database credentials.

## User Registration and Login

1. Users can register by visiting the `register` route.
2. After registration, users can log in by visiting the `auth` route.
3. Upon successful login, users will be redirected to the dashboard.

## Dashboard

1. The dashboard allows users to view and delete their uploaded images.
2. Users can also customize settings such as file name length and upload endpoint password.
3. The dashboard is accessible only to logged-in users.
4. The dashboard includes 4 boxes to show site statistics such as registered users, total uploads, total uploaded data size, and version of the host system.

## Administrator Dashboard

1. The administrator dashboard allows administrators to control service settings, user management, and view site statistics.
2. Administrators can control allowed file types, general upload size limit, and user management such as suspending or deleting accounts.
3. The administrator dashboard includes an announcement section.
4. Administrators can post announcements from the administrator dashboard.

## User Management Functionalities

1. Administrators can suspend or delete users from the administrator dashboard.
2. Administrators can set upload size limits for individual users.
3. Administrators can update the forgot password domain from the administrator dashboard.

## Site Statistics Functionalities

1. The dashboard displays site statistics such as registered users, total uploads, total uploaded data size, and host system version.
2. Administrators can view site statistics from the administrator dashboard.
3. The `config/config.js` file includes the configuration for site statistics.

## New Routes and Functionalities

### `admin/admin_dashboard.js`

- **Post Announcement**: Route to post an announcement.
- **Suspend User**: Route to suspend a user.
- **Delete User**: Route to delete a user.
- **Set Upload Size**: Route to set upload size for a user.
- **Update Forgot Password Domain**: Route to update forgot password domain.
- **Fetch Announcements**: Route to fetch announcements.
- **Fetch Forgot Password Domain**: Route to fetch forgot password domain.

### `auth/auth.js`

- **Login**: Route for user login.

### `dashboard/dashboard.js`

- **Fetch User Images**: Route to fetch user images.
- **Fetch User Settings**: Route to fetch user settings.
- **Fetch Site Statistics**: Route to fetch site statistics.
- **Delete Image**: Route to delete an image.
- **Update User Settings**: Route to update user settings.

### `forgot_password/forgot_password.js`

- **Request Password Reset**: Route to request password reset.
- **Update Password**: Route to update password.

### `reset_password/reset_password.js`

- **Request Password Reset**: Route to request password reset.
- **Reset Password**: Route to reset password.

## Middleware Setup

### `middleware/authMiddleware.js`

- **isAuthenticated**: Middleware to check if the user is authenticated.
- **isAdmin**: Middleware to check if the user is an admin.

To use the middleware, import the functions and use them in your routes. For example:

```javascript
import { isAuthenticated, isAdmin } from './middleware/authMiddleware';

router.get('/protected-route', isAuthenticated, (req, res) => {
    res.send('This is a protected route');
});

router.post('/admin-route', isAuthenticated, isAdmin, (req, res) => {
    res.send('This is an admin route');
});
```

## Project Description Update

This project is no longer just a script but a file sharing CDN system.
