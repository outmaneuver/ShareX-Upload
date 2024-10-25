# Share-X-Upload
ShareX upload script made for apache web servers with filetype support!

Disclaimer: ShareX is a free and open source program that lets you capture or record any area of your screen and share it with a single press of a key.
The program can be found over at https://getsharex.com/

## Installation

1. Upload the `upload.php` script to your web server.
2. Configure the `example.sxcu` file with your domain name and other settings.
3. Import the `example.sxcu` file into ShareX.
4. You should now be able to upload files directly to your site via ShareX.

## Configuration

### `upload.php`

- **Tokens**: Add your tokens to the `$tokens` array in `upload.php`. These tokens are used to authenticate the upload requests.
- **Allowed File Types**: Configure the allowed file types by modifying the `$allowedFiles` array in `upload.php`.
- **Maximum File Size**: Set the maximum file size for uploads by changing the `$maxFileSize` variable in `upload.php`.

### `example.sxcu`

- **Version**: The version of the ShareX configuration file.
- **Name**: The name of the configuration.
- **DestinationType**: The type of destination (e.g., ImageUploader, TextUploader, FileUploader).
- **RequestType**: The type of HTTP request (e.g., POST).
- **RequestURL**: The URL of the `upload.php` script on your server.
- **Body**: The body type of the request (e.g., MultipartFormData).
- **FileFormName**: The name of the form field for the file upload (e.g., sharex).
- **URL**: The URL format for the uploaded file.

## Usage

1. Open ShareX and go to `Destinations` > `Custom uploaders`.
2. Click on `Import` and select the `example.sxcu` file.
3. Configure the uploader settings as needed.
4. Use ShareX to capture or record your screen and upload the file using the custom uploader.

## Error Handling and Logging

The `upload.php` script includes error handling and logging mechanisms. Errors are logged to the `error_log.txt` file in the same directory as the script. The script returns appropriate HTTP status codes and error messages in the JSON response.

## Security

- Ensure that the `upload.php` script is not publicly accessible without proper authentication.
- Use strong and unique tokens for authentication.
- Regularly review and update the allowed file types and maximum file size settings.

## MySQL Setup

1. Install MySQL on your server if it is not already installed.
2. Create a new database for the ShareX upload system.
3. Import the provided `database.sql` file to create the necessary tables.
4. Update the `config.php` file with your MySQL database credentials.

## User Registration and Login

1. Users can register by visiting the `register.php` page.
2. After registration, users can log in by visiting the `auth.php` page.
3. Upon successful login, users will be redirected to the dashboard.

## Dashboard

1. The dashboard allows users to view and delete their uploaded images.
2. Users can also customize settings such as file name length and upload endpoint password.
3. The dashboard is accessible only to logged-in users.

## License

This project is licensed under the GNU General Public License v3.0. See the `LICENSE` file for more details.

P.S. there are tutorials on youtube.com if you can't follow these steps :)
