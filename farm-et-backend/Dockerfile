FROM php:8.3-cli-alpine

# Set Composer environment variable
ENV COMPOSER_ALLOW_SUPERUSER=1

# Install PostgreSQL & PHP extension dependencies
RUN apk add --no-cache \
    postgresql-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    && docker-php-ext-install pdo pdo_pgsql zip bcmath

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

# Copy backend application files
COPY . .

# Remove any cached service bootstrap files from host environment
RUN rm -f bootstrap/cache/*.php

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-scripts

# Set file permissions for storage and cache directories
RUN chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

EXPOSE 8000

# Run package discovery, migrations, and start Laravel server
CMD php artisan package:discover --ansi && php artisan migrate --force && php artisan serve --host=0.0.0.0 --port=8000
