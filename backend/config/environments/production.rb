# frozen_string_literal: true

Rails.application.configure do
  config.eager_load = true
  config.log_level = :info
  config.log_tags = [:request_id]
  config.log_to_stdout = true
  config.force_ssl = false
end
