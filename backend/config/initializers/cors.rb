# frozen_string_literal: true

Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins ENV.fetch('CORS_ALLOWED_ORIGIN', 'http://localhost:3000')
    resource '*',
             headers: :any,
             methods: %i[get post patch put delete options]
  end
end
