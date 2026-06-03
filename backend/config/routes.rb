Rails.application.routes.draw do
  namespace :api do
    namespace :v1 do
      resources :tickets, only: [:index, :show, :create, :update, :destroy] do
        resources :comments, only: [:create]
      end
    end
  end
end
