# Cutr : Shorten URLs and unintrusive analytics

This project is a URL shortener and analytics application built with React for the frontend and Go for the backend. It allows users to shorten URLs, track analytics, and manage generated URLs.

## Features

- Shorten URLs
- Track analytics for shortened URLs
- Manage URLs with a PIN
- Dark mode support with theme switching
- Responsive design

### Backend Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/niravkpatel36/cutr.git
   cd cutr
   ```

2. Install Go dependencies:

   ```bash
   go mod tidy
   ```

3. Set up PostgreSQL database and update the environment variables as required in `utils.go` file.

4. Run the backend server:

   ```bash
   go run main.go
   ```

### Frontend Setup

1. Navigate to the `ui` directory:

   ```bash
   cd ui
   ```

2. Install dependencies:

   ```bash
   yarn
   ```

3. Start the development server:

   ```bash
   yarn dev
   ```

## Usage

1. Access the application in your browser at `http://localhost:3000`.
2. Use the interface to shorten URLs and view analytics.
3. Manage URLs using the provided PIN for security.

## API Endpoints

- **POST /new**: Create a new shortened URL.
- **POST /search**: Search for a URL and get redirect information.
- **POST /analytics**: Retrieve analytics data for a URL.
- **DELETE /delete**: Delete a shortened URL using a PIN.

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
