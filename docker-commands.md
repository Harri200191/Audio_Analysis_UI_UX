# Commands
# Create Docker Network
docker network create mongo-network

# Start MongoDB
docker run -d \
-p 27017:27017 \
-e MONGO_INITDB_ROOT_USERNAME: root \ 
-e MONGO_INITDB_ROOT_PASSWORD: example \
--net mongo-network \
--name mongodb \
mongo

# Start MongoDB Express
docker run -d \
-p 8081:8081 \
-e ME_CONFIG_MONGODB_ADMINUSERNAME=admin \
-e ME_CONFIG_MONGODB_ADMINPASSWORD=password \
-e ME_CONFIG_MONGODB_SERVER=mongodb \
--net mongo-network \
--name mongo-express \
mongo-express

