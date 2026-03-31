# Stage 1: Build the Go application
FROM golang:latest AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod tidy

COPY . .

RUN go build -o cutr meghrathod/shorty

# Stage 2: GeoIP database setup and application image
FROM debian:bookworm

WORKDIR /app

# Copy the Go binary
COPY --from=builder /app/cutr /app/cutr

# Copy the setup script and start script
COPY geoip_setup.sh /app/
COPY start.sh /app/

# Set environment variables (IMPORTANT: Set these during the build)
ARG MAXMIND_ACCOUNT_ID
ARG MAXMIND_LICENSE_KEY
ARG PORT
ARG USERNAME
ARG PASSWORD
ARG DB_HOST
ARG DB_PORT
ARG DB_NAME
ARG ALLOWED_ORIGINS
ENV MAXMIND_ACCOUNT_ID=$MAXMIND_ACCOUNT_ID \
    MAXMIND_LICENSE_KEY=$MAXMIND_LICENSE_KEY \
    PORT=$PORT \
    USERNAME=$USERNAME \
    PASSWORD=$PASSWORD \
    DB_HOST=$DB_HOST \
    DB_PORT=$DB_PORT \
    DB_NAME=$DB_NAME \
    ALLOWED_ORIGINS=$ALLOWED_ORIGINS

# Install dependencies and run the setup script
RUN apt-get update && \
    apt-get install -y --no-install-recommends ca-certificates gettext wget && \
    chmod +x /app/geoip_setup.sh && \
    mkdir -p /usr/local/share/GeoIP && \
    /app/geoip_setup.sh && \
    rm -rf /var/lib/apt/lists/*

# Make the start script executable
RUN chmod +x /app/start.sh

# Start the application using the start script
CMD /app/start.sh

EXPOSE $PORT